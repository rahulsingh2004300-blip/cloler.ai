from fastapi import FastAPI

app = FastAPI(title="cloler.ai telephony agent")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "telephony-agent"}
