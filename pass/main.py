from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, Response
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, config
from hypercorn.asyncio import serve
from hypercorn.config import Config
import asyncio
from datetime import datetime
from models import get_db, Pass, Base, engine
import redis
from dotenv import load_dotenv
import os
from cryptography.fernet import Fernet
from passes import generate_pass


class CreatePass(BaseModel):
    id: str
    title: str
    date_time: datetime
    address: str
    price: int
    post_id: str
    user_id: Optional[str] = None
    image: str


class ScanPass(BaseModel):
    data: str


Base.metadata.create_all(bind=engine)

app = FastAPI(debug=True)

# redis = redis.Redis(host="redis", port=6379, db=0)


@app.get("/passes/{pass_id}")
async def get_pass(pass_id: str, db: Session = Depends(get_db)):
    try:
        # result = redis.get(post_id)
        # if result is not None:
        #     redis.expire(pass_id, 60 * 60 * 24 * 7)
        #     return json.loads(result)

        pass_data = db.query(Pass).filter(Pass.id == pass_id).first()
        if pass_data is None:
            raise HTTPException(status_code=404, detail="Pass not found")

        # redis.set(str(post.id), json.dumps(post.to_dict()), ex=(60 * 60 * 24 * 7))
        return pass_data.to_dict()
    except HTTPException as http_exc:
        raise http_exc  # Re-raise the original HTTPException
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Database error occurred")
    except Exception:
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@app.get("/pkpasses/{pass_id}")
async def get_pkpass(pass_id: str, db: Session = Depends(get_db)):
    try:
        # result = redis.get(post_id)
        # if result is not None:
        #     redis.expire(pass_id, 60 * 60 * 24 * 7)
        #     return json.loads(result)

        pass_data = db.query(Pass).filter(Pass.id == pass_id).first()
        if pass_data is None:
            raise HTTPException(status_code=404, detail="Pass not found")

        # redis.set(str(post.id), json.dumps(post.to_dict()), ex=(60 * 60 * 24 * 7))
        headers = {
            "Content-Disposition": "attachment; filename=" + pass_data.title + ".pkpass",
            "Content-Type": "application/vnd.apple.pkpass",
        }

        pkpass = generate_pass(
            str(pass_data.title),
            pass_data.date_time,
            pass_data.address,
            str(pass_data.price),
            pass_data.qr_code,
            pass_data.scanned,
            str(pass_data.pass_number),
        )
        return Response(
            content=pkpass.getvalue(),
            headers=headers,
        )
    except HTTPException as http_exc:
        raise http_exc  # Re-raise the original HTTPException
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Database error occurred")
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@app.post("/passes")
async def create_pass(post: CreatePass, db: Session = Depends(get_db)):
    try:
        cipher_suite = Fernet(bytes(os.environ["PASS_QR_KEY"], encoding="utf-8"))
        qr_code = cipher_suite.encrypt(post.id.encode()).decode()
        new_pass = Pass(qr_code=qr_code, **post.dict())
        db.add(new_pass)
        db.commit()

        # redis.set(str(new_post.id), json.dumps(new_post.to_dict()), ex=(60 * 60 * 24 * 7))
        return new_pass.to_dict()
    except HTTPException as http_exc:
        db.rollback()
        raise http_exc  # Re-raise the original HTTPException
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error occurred")
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@app.patch("/passes/{post_id}")
async def update_pass(pass_id: str, create_pass: CreatePass, db: Session = Depends(get_db)):
    try:
        old_pass = db.query(Pass).filter(Pass.id == pass_id).first()
        if old_pass is None:
            raise HTTPException(status_code=404, detail="Pass not found")

        update_values = create_pass.dict(exclude_unset=True)
        db.query(Pass).filter(Pass.id == pass_id).update(**update_values)
        db.commit()

        # redis.set(str(post.id), json.dumps(post.to_dict()), ex=(60 * 60 * 24 * 7))
        return old_pass.to_dict()
    except HTTPException as http_exc:
        db.rollback()
        raise http_exc  # Re-raise the original HTTPException
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error occurred")
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@app.delete("/passes/{pass_id}")
async def delete_pass(pass_id: str, db: Session = Depends(get_db)):
    try:
        old_pass = db.query(Pass).filter(Pass.id == pass_id).first()
        if old_pass is None:
            raise HTTPException(status_code=404, detail="Pass not found")

        db.delete(old_pass)
        db.commit()
        # redis.delete(post_id)
    except HTTPException as http_exc:
        db.rollback()
        raise http_exc  # Re-raise the original HTTPException
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error occurred")
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@app.post("/scan/{post_id}")
async def scan_pass(post_id: str, scan_data: ScanPass, db: Session = Depends(get_db)):
    try:
        cipher_suite = Fernet(bytes(os.environ["PASS_QR_KEY"], encoding="utf-8"))
        data = cipher_suite.decrypt(scan_data.data.encode()).decode()
        post = db.query(Pass).filter(Pass.id == data).filter(Pass.post_id == post_id).first()
        if post is None:
            raise HTTPException(status_code=404, detail="Pass not found")
        if post.scanned:
            raise HTTPException(status_code=404, detail="Pass already scanned")
        else:
            post.scanned = True
        db.commit()
        # redis.set(str(post.id), json.dumps(post.to_dict()), ex=(60 * 60 * 24 * 7))
        return {"status": "success", "detail": "Pass scanned"}
    except HTTPException as http_exc:
        db.rollback()
        raise http_exc  # Re-raise the original HTTPException
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error occurred")
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


if __name__ == "__main__":
    load_dotenv()
    PORT = os.environ["PORT"]
    assert PORT is not None
    config = Config()
    config.bind = "0.0.0.0:{}".format(PORT)
    asyncio.run(serve(app, config=config))
