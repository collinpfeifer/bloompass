from uuid import uuid4
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import Integer, Column, Float, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.sql.functions import now
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

Base = declarative_base()
load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]
assert DATABASE_URL is not None

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class Post(Base, SerializerMixin):
    __tablename__ = "posts"
    id = Column(UUID(as_uuid=True), primary_key=True, unique=True, index=True, default=uuid4)
    post_number = Column(Integer, unique=True, default=lambda: uuid4().int & (10**18 - 1))
    title = Column(String)
    date_time = Column(DateTime)
    address = Column(String)
    price = Column(Float)
    organization_id = Column(UUID(as_uuid=True))
    clicks = Column(Integer, default=0)
    sales = Column(Integer, default=0)
    organization_stripe_account_id = Column(String)
    image = Column(String)
    created_at = Column(DateTime, default=now())
    updated_at = Column(DateTime, default=now(), onupdate=now())
