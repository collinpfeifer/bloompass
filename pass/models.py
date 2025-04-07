from uuid import uuid4
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import Boolean, Integer, Column, Float, String, DateTime, null
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.sql.functions import now, random
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

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


class Device(Base, SerializerMixin):
    __tablename__ = "devices"
    id = Column(UUID(as_uuid=True), primary_key=True, unique=True, index=True, default=uuid4)
    push_token = Column(String, primary_key=True, unique=True, index=True)
    device_library_identifier = Column(String)


class Pass(Base, SerializerMixin):
    __tablename__ = "passes"
    id = Column(UUID(as_uuid=True), primary_key=True, unique=True, index=True, default=uuid4)
    pass_number = Column(Integer, unique=True, default=lambda: uuid4().int & (10**18 - 1))
    title = Column(String)
    date_time = Column(DateTime)
    address = Column(String)
    price = Column(Float)
    post_id = Column(UUID(as_uuid=True))
    user_id = Column(UUID(as_uuid=True), nullable=True, default=None)
    image = Column(String)
    qr_code = Column(String)
    scanned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=now())
    updated_at = Column(DateTime, default=now(), onupdate=now())


class Registration(Base, SerializerMixin):
    __tablename__ = "registrations"
    id = Column(UUID(as_uuid=True), primary_key=True, unique=True, index=True, default=uuid4)
    devices_per_pass = Column(Integer, default=1)
    passes_per_device = Column(Integer, default=1)
    created_at = Column(DateTime, default=now())
    updated_at = Column(DateTime, default=now(), onupdate=now())
