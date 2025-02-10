import { Schema } from 'mongoose';

export function addIdAfterSave(schema: Schema) {
  schema.pre('save', function (next) {
    if (this.isNew) {
      this.id = this._id.toString();
    }
    next();
  });
}
