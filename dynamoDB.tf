resource "aws_dynamodb_table" "visitorCountTable" {
  name         = "visitorCountTable"
  billing_mode = "PAY_PER_REQUEST"
  attribute {
    name = "id"
    type = "S"
  }
  hash_key = "id"
}

resource "aws_dynamodb_table_item" "visitorCountItem" {
  table_name = aws_dynamodb_table.visitorCountTable.name
  hash_key   = aws_dynamodb_table.visitorCountTable.hash_key
  item       = <<ITEM
{
    "id": {"S": "keyCount"},
    "itemCount": {"S": "100"}
}
ITEM

  # Seed only. visitorCountFunction owns this item after the first write, so
  # without ignore_changes an apply resets the live count back to 100.
  lifecycle {
    ignore_changes = [item]
  }
}

resource "aws_dynamodb_table" "timeTable" {
  name         = "timeTable"
  billing_mode = "PAY_PER_REQUEST"
  attribute {
    name = "id"
    type = "S"
  }
  hash_key = "id"
}

resource "aws_dynamodb_table_item" "timeItem" {
  table_name = aws_dynamodb_table.timeTable.name
  hash_key   = aws_dynamodb_table.timeTable.hash_key
  item       = <<ITEM
{
    "id": {"S": "keyTime"},
    "itemTime": {"S": "1700076925"}
}
ITEM

  # Seed only, owned by timeFunction after the first write. The live value is
  # stored as N and this seed as S, so an apply would also flip the type.
  lifecycle {
    ignore_changes = [item]
  }
}
