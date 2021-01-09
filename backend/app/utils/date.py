from babel.dates import format_datetime, get_timezone
from datetime import datetime


def format_date(date: datetime) -> str:
    day = format_datetime(date, "dd",  locale='pt_Br')
    month = format_datetime(date, "MMMM", locale='pt_Br')
    hour = format_datetime(date, "HH:mm", tzinfo=get_timezone('America/Sao_Paulo'), locale='pt_Br')
    date = f'dia {day} de {month.title()}, às {hour}h'

    return date