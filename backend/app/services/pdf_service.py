import pdfplumber
import io
from fastapi import HTTPException

def extract_text_from_pdf(file_bytes: bytes) -> str:
  try:
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        text_parts = []
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        full_text = "\n".join(text_parts)
  except Exception as e:
    raise HTTPException(
        status_code = 422,
        detail=f"Could not read PDF file: {str(e)}"
    )

  if not full_text.strip():
    raise HTTPException(
        status_code=422,
        detail="PDF appears to be empty or contains no extractable text (It may be a scanned image)."
    )
  return full_text