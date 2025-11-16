const Discount = require("./discountModel")

const readWithId = async (id) => {
    return await Discount.findOne({ _id: id }).select(
    "_id name active type value"
  )
}

module.exports = { readWithId }
