-- CreateIndex
CREATE INDEX "Record_tableId_order_id_idx" ON "Record"("tableId", "order", "id");

-- CreateIndex
CREATE INDEX "Cell_fieldId_value_idx" ON "Cell"("fieldId", "value");
