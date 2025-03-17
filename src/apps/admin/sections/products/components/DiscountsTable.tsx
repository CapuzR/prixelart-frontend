import Table1 from "@components/Table"
import { useState } from "react"

export default function DiscountsTable({
  handleActive,
  discountList,
  deleteElement,
}) {
  const [pageNumber, setPageNumber] = useState(1)
  const [itemsPerPage, setItemPerPage] = useState(20)
  const [totalElements, setTotalElements] = useState(discountList?.length)

  const headers = [
    { title: "Nombre", type: "string" },
    { title: "Activo", type: "string" },
    { title: "Tipo", type: "string" },
    { title: "Valor", type: "string" },
    { title: "Productos aplicados", type: "string" },
    "",
  ]

  const properties = ["name", "active", "type", "value", "appliedProducts"]

  const handleUpdate = (element) => {
    console.log(element)
  }

  return (
    <Table1
      headers={headers}
      elements={discountList}
      properties={properties}
      updateFunction={handleUpdate}
      deleteFunction={deleteElement}
      setPageNumber={setPageNumber}
      pageNumber={pageNumber}
      itemsPerPage={itemsPerPage}
      maxLength={totalElements}
    />
  )
}
