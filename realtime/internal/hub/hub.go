package hub

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients. Mapped by project_id -> map of clients
	clients map[string]map[*Client]bool

	// Inbound messages from the redis pubsub.
	broadcast chan MessagePayload

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

type MessagePayload struct {
	ProjectID string      `json:"project_id"`
	Event     string      `json:"event"`
	Data      interface{} `json:"data"`
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan MessagePayload),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[string]map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			if _, ok := h.clients[client.ProjectID]; !ok {
				h.clients[client.ProjectID] = make(map[*Client]bool)
			}
			h.clients[client.ProjectID][client] = true
			
		case client := <-h.unregister:
			if clients, ok := h.clients[client.ProjectID]; ok {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.send)
					if len(clients) == 0 {
						delete(h.clients, client.ProjectID)
					}
				}
			}
			
		case message := <-h.broadcast:
			// Broadcast only to clients subscribed to this project ID
			if clients, ok := h.clients[message.ProjectID]; ok {
				for client := range clients {
					select {
					case client.send <- message:
					default:
						// If channel is full or blocked, forcefully close it to prevent deadlock
						close(client.send)
						delete(clients, client)
					}
				}
				if len(clients) == 0 {
					delete(h.clients, message.ProjectID)
				}
			}
		}
	}
}

func (h *Hub) Broadcast(msg MessagePayload) {
	h.broadcast <- msg
}
