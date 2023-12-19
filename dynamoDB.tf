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
}
