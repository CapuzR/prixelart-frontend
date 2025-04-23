import Table1 from "@components/Table"
import { useState } from "react"
import { Organization } from "../../../../../types/organization.types"
import { Discount } from "../../../../../types/discount.types"
interface TableProps {
  handleActive: (type: string, element: Discount, action: string) => void
  discountList: Discount[]
  deleteElement: (type: string, id: string) => void
}
export default function DiscountsTable({
  handleActive,
  discountList,
  deleteElement,
}: TableProps) {
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

  const handleUpdate = (element: any) => {
    console.log(element)
     handleActive ("discount", element, "update")
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
