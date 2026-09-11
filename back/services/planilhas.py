from pathlib import Path


def read_excel(file_path: str) -> dict:
    """
    Lê arquivos XLSX e XLS.

    Retorna:
    {
        "headers": [],
        "rows": []
    }
    """

    extension = detect_excel_type(
    file_path
    )

    # ==========================
    # XLSX (Excel moderno)
    # ==========================
    if extension == ".xlsx":

        try:
            from openpyxl import load_workbook

        except ModuleNotFoundError as exc:
            raise ModuleNotFoundError(
                "Instale openpyxl: pip install openpyxl"
            ) from exc
      
        workbook = load_workbook(
            filename=file_path,
            read_only=True,
            data_only=True
        )

        sheet = workbook.active

        rows = list(
            sheet.iter_rows(values_only=True)
        )

    # ==========================
    # XLS (Excel legado)
    # ==========================
    elif extension == ".xls":

        try:
            import xlrd

        except ModuleNotFoundError as exc:
            raise ModuleNotFoundError(
                "Instale xlrd: pip install xlrd"
            ) from exc
    # ==============Verificação=========================
        print("=" * 50)
        print("Arquivo recebido:")
        print(file_path)

        print("Existe?")
        print(Path(file_path).exists())

        print("Extensão:")
        print(Path(file_path).suffix.lower())

        print("=" * 50)
        with open(file_path, "rb") as arquivo:
            assinatura = arquivo.read(8)

        print("Assinatura:", assinatura)
        # ==============================================

        workbook = xlrd.open_workbook(file_path)

        sheet = workbook.sheet_by_index(0)

        rows = [
            sheet.row_values(i)
            for i in range(sheet.nrows)
        ]

    else:

        raise ValueError(
            f"Formato não suportado: {extension}"
        )

    # ==========================
    # Processamento comum
    # ==========================
    if not rows:

        return {
            "headers": [],
            "rows": []
        }

    headers = [
        str(value) if value is not None else ""
        for value in rows[0]
    ]

    data_rows = []

    for row in rows[1:31]:

        data_rows.append(
            [value for value in row]
        )

    return {
        "headers": headers,
        "rows": data_rows,
        "total_rows": len(rows) -1,
        "preview_rows": len (data_rows)
    }
# ====================== Detecta o formato real====================================
def detect_excel_type(file_path: str) -> str:
    """
    Detecta formato real do arquivo.
    """

    with open(file_path, "rb") as arquivo:
        assinatura = arquivo.read(8)

    print("Assinatura:", assinatura)

    # XLSX / XLSM / arquivo OpenXML
    if assinatura[:2] == b"PK":
        return ".xlsx"

    # XLS antigo
    if assinatura[:4] == b"\xD0\xCF\x11\xE0":
        return ".xls"

    raise ValueError(
        f"Formato desconhecido: {assinatura}"
    )