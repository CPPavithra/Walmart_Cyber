clients = []

async def broadcast_log(log):
    for client in clients:
        try:
            await client.send_json(log)
        except:
            clients.remove(client)
