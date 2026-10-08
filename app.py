import os
import time

import dash
from dash import html, dcc, Input, Output, State, callback
import dash_bootstrap_components as dbc
from databricks.sdk import WorkspaceClient

# ── Databricks client (auto-authenticated in Apps) ──────────────────────────
w = WorkspaceClient()

# ── Genie Spaces defined as app resources ────────────────────────────────────
GENIE_SPACES = {
    "Product Catalog and Pricing": "01f1b2ab24901b63bbaa91c2334e5730",
    "Organisational Structure Analytics": "01f1b81f82481483a3074d9e1cb4d60e",
}

# ── Dash application ────────────────────────────────────────────────────────
app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])
app.title = "SNCF Data Assistant"

app.layout = dbc.Container(
    [
        # Header
        dbc.Row(
            dbc.Col(
                [
                    html.H2("SNCF Data Assistant", className="text-center mt-4 mb-1"),
                    html.P(
                        "Interrogez vos données via les Genie Spaces configurés.",
                        className="text-center text-muted mb-3",
                    ),
                ]
            )
        ),
        # Space selector
        dbc.Row(
            dbc.Col(
                dbc.Select(
                    id="space-selector",
                    options=[
                        {"label": name, "value": sid}
                        for name, sid in GENIE_SPACES.items()
                    ],
                    value=list(GENIE_SPACES.values())[0],
                ),
                width=6,
                className="mx-auto mb-3",
            ),
            justify="center",
        ),
        # Chat history
        dbc.Row(
            dbc.Col(
                html.Div(
                    id="chat-history",
                    children=[html.P("Aucun message.", className="text-muted")],
                    className="border rounded p-3",
                    style={
                        "height": "420px",
                        "overflowY": "auto",
                        "backgroundColor": "#f8f9fa",
                    },
                ),
                width=8,
                className="mx-auto",
            ),
            justify="center",
        ),
        # Input bar
        dbc.Row(
            dbc.Col(
                dbc.InputGroup(
                    [
                        dbc.Input(
                            id="user-input",
                            placeholder="Posez votre question…",
                            type="text",
                            debounce=True,
                        ),
                        dbc.Button(
                            "Envoyer", id="send-btn", color="primary", n_clicks=0
                        ),
                    ],
                    className="mt-3",
                ),
                width=8,
                className="mx-auto",
            ),
            justify="center",
        ),
        # Hidden stores
        dcc.Store(id="conversation-store", data={"conversation_id": None, "messages": []}),
    ],
    fluid=True,
    className="pb-4",
)


# ── Genie helper ─────────────────────────────────────────────────────────────
def query_genie(space_id: str, question: str, conversation_id: str | None = None):
    """Send *question* to a Genie Space and return (conversation_id, answer_text)."""
    try:
        if conversation_id is None:
            resp = w.genie.start_conversation(space_id=space_id, content=question)
        else:
            resp = w.genie.create_message(
                space_id=space_id,
                conversation_id=conversation_id,
                content=question,
            )

        conv_id = resp.conversation_id
        msg_id = resp.message_id

        # Poll until the message is complete (max ~2 min)
        for _ in range(60):
            msg = w.genie.get_message(
                space_id=space_id,
                conversation_id=conv_id,
                message_id=msg_id,
            )
            if msg.status and msg.status.value == "COMPLETED":
                parts = []
                for att in msg.attachments or []:
                    if att.text and att.text.content:
                        parts.append(att.text.content)
                    if att.query and att.query.query:
                        parts.append(f"```sql\n{att.query.query}\n```")
                answer = "\n\n".join(parts) if parts else "Réponse reçue (aucun contenu textuel)."
                return conv_id, answer
            if msg.status and msg.status.value in ("FAILED", "CANCELLED"):
                return conv_id, f"La requête a échoué ({msg.status.value})."
            time.sleep(2)

        return conv_id, "Délai dépassé – la réponse prend trop de temps."
    except Exception as exc:
        return conversation_id, f"Erreur : {exc}"


# ── Callback ─────────────────────────────────────────────────────────────────
@callback(
    Output("chat-history", "children"),
    Output("conversation-store", "data"),
    Output("user-input", "value"),
    Input("send-btn", "n_clicks"),
    Input("user-input", "n_submit"),
    State("user-input", "value"),
    State("space-selector", "value"),
    State("conversation-store", "data"),
    prevent_initial_call=True,
)
def handle_send(_n_clicks, _n_submit, user_input, space_id, store):
    if not user_input or not user_input.strip():
        return dash.no_update, dash.no_update, dash.no_update

    messages = store.get("messages", [])
    conversation_id = store.get("conversation_id")

    messages.append({"role": "user", "content": user_input.strip()})

    conversation_id, answer = query_genie(space_id, user_input.strip(), conversation_id)
    messages.append({"role": "assistant", "content": answer})

    # Build chat display
    elements = []
    for msg in messages:
        if msg["role"] == "user":
            elements.append(
                html.Div(
                    [html.Strong("Vous : "), html.Span(msg["content"])],
                    className="mb-2 text-end",
                )
            )
        else:
            elements.append(
                html.Div(
                    [html.Strong("Assistant : "), dcc.Markdown(msg["content"])],
                    className="mb-2 p-2 bg-white rounded",
                )
            )

    new_store = {"conversation_id": conversation_id, "messages": messages}
    return elements, new_store, ""


# ── Reset conversation when switching space ──────────────────────────────────
@callback(
    Output("conversation-store", "data", allow_duplicate=True),
    Output("chat-history", "children", allow_duplicate=True),
    Input("space-selector", "value"),
    prevent_initial_call=True,
)
def reset_conversation(_space_id):
    return (
        {"conversation_id": None, "messages": []},
        [html.P("Conversation réinitialisée.", className="text-muted")],
    )


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("DATABRICKS_APP_PORT", "8050")),
    )

