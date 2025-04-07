from wallet.models import Pass, Barcode, StoreCard
import os
from datetime import datetime


def generate_pass(
    title: str, date_time: datetime, address: str, price: str, barcode_message: str, scanned: bool, pass_number: str
):
    cardInfo = StoreCard()
    cardInfo.addPrimaryField("title", title, "Title")
    # cardInfo.addSecondaryField("datetime", date_time, "Date & Time")
    cardInfo.addHeaderField("scanned", scanned, "Scanned")
    organization_name = os.environ["ORGANIZATION_NAME"]
    pass_type_identifier = os.environ["PASS_TYPE_IDENTIFIER"]
    team_identifier = os.environ["TEAM_IDENTIFIER"]

    passfile = Pass(
        cardInfo,
        passTypeIdentifier=pass_type_identifier,
        organizationName=organization_name,
        teamIdentifier=team_identifier,
    )
    passfile.description = "Adfluent Pass " + title
    passfile.serialNumber = pass_number
    passfile.foregroundColor = "#81aa1b"
    passfile.backgroundColor = "#091b28"
    passfile.addFile("logo.png", open("utils/logo.png", "rb"))
    passfile.addFile("icon.png", open("utils/icon.png", "rb"))
    passfile.barcode = Barcode(message=barcode_message, format="PKBarcodeFormatQR")
    return passfile.create("certificate.pem", "key.pem", "AppleWWDRCAG4.cer", os.environ["PASS_KEY"])
