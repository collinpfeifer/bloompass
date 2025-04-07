from fastapi import FastAPI, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from base64 import urlsafe_b64decode
from pydantic import BaseModel, config
from datetime import datetime
from models import get_db, Post, Base, engine
import redis
from dotenv import load_dotenv
from hypercorn.asyncio import serve
from hypercorn.config import Config
import asyncio
import os
import json


class CreatePost(BaseModel):
    title: str
    date_time: datetime
    address: str
    price: float
    organization_id: str
    organization_stripe_account_id: str
    image: str


Base.metadata.create_all(bind=engine)

app = FastAPI()

# redis = redis.Redis(host="redis", port=6379, db=0)


@app.get("/posts/{post_id}")
async def get_post(post_id: str, db: Session = Depends(get_db)):
    try:
        # result = redis.get(post_id)
        # if result is not None:
        #     redis.expire(post_id, 60 * 60 * 24 * 7)
        #     return json.loads(result)
        post = db.query(Post).filter(Post.id == post_id).first()
        if post is None:
            raise HTTPException(status_code=404, detail="Post not found")
        # redis.set(str(post.id), json.dumps(post.to_dict()), ex=(60 * 60 * 24 * 7))
        return post.to_dict()
    except HTTPException as http_exc:
        raise http_exc  # Re-raise the original HTTPException
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Database error occurred")
    except Exception:
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@app.post("/posts")
async def create_post(post: CreatePost, db: Session = Depends(get_db)):
    try:
        new_post = Post(**post.dict())
        db.add(new_post)
        db.commit()
        # redis.set(str(new_post.id), json.dumps(new_post.to_dict()), ex=(60 * 60 * 24 * 7))
        return new_post.to_dict()
    except HTTPException as http_exc:
        db.rollback()
        raise http_exc  # Re-raise the original HTTPException
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error occurred")
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@app.get("/posts")
async def get_posts(request: Request, db: Session = Depends(get_db)):
    try:
        header = request.headers.get("X-Apigateway-Api-Userinfo")
        print(header)
        if header is None:
            raise HTTPException(status_code=401, detail="Unauthorized")
        padding = b"=" * (4 - (len(header) % 4))
        padding = padding.decode("utf-8")
        org_data = json.loads(urlsafe_b64decode(header + padding))
        print(org_data.get("sub"))
        posts = db.query(Post).filter(Post.organization_id == org_data.get("sub")).all()
        print(posts)
        return posts
    except HTTPException as http_exc:
        raise http_exc  # Re-raise the original HTTPException
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Database error occurred")
    except Exception:
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@app.patch("/posts/{post_id}")
async def update_post(post_id: str, create_post: CreatePost, db: Session = Depends(get_db)):
    try:
        post = db.query(Post).filter(Post.id == post_id).first()
        if post is None:
            raise HTTPException(status_code=404, detail="Post not found")
        update_values = create_post.dict(exclude_unset=True)
        db.query(Post).filter(Post.id == post_id).update(**update_values)
        db.commit()

        # redis.set(str(post.id), json.dumps(post.to_dict()), ex=(60 * 60 * 24 * 7))
        return post.to_dict()
    except HTTPException as http_exc:
        db.rollback()
        raise http_exc  # Re-raise the original HTTPException
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error occurred")
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@app.get("/posts/{post_id}/sale")
async def post_sale(post_id: str, db: Session = Depends(get_db)):
    try:
        post = db.query(Post).filter(Post.id == post_id).first()
        if post is None:
            raise HTTPException(status_code=404, detail="Post not found")
        post.sales = post.sales + 1
        db.commit()

        # redis.set(str(post.id), json.dumps(post.to_dict()), ex=(60 * 60 * 24 * 7))
        return post.to_dict()
    except HTTPException as http_exc:
        db.rollback()
        raise http_exc  # Re-raise the original HTTPException
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error occurred")
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@app.get("/posts/{post_id}/click")
async def post_click(post_id: str, db: Session = Depends(get_db)):
    try:
        post = db.query(Post).filter(Post.id == post_id).first()
        if post is None:
            raise HTTPException(status_code=404, detail="Post not found")
        post.clicks = post.clicks + 1
        db.commit()

        # redis.set(str(post.id), json.dumps(post.to_dict()), ex=(60 * 60 * 24 * 7))
        return post.to_dict()
    except HTTPException as http_exc:
        db.rollback()
        raise http_exc  # Re-raise the original HTTPException
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error occurred")
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@app.delete("/posts/{post_id}")
async def delete_post(post_id: str, db: Session = Depends(get_db)):
    try:
        post = db.query(Post).filter(Post.id == post_id).first()
        if post is None:
            raise HTTPException(status_code=404, detail="Post not found")
        db.delete(post)
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


if __name__ == "__main__":
    load_dotenv()
    PORT = os.environ["PORT"]
    assert PORT is not None
    config = Config()
    config.bind = "0.0.0.0:{}".format(PORT)
    asyncio.run(serve(app, config=config))
