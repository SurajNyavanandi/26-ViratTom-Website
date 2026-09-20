const Example = require('../models/Example');

/**
 * Example Service Layer
 * Encapsulate your business logic and database queries here
 */
class ExampleService {
  static async getAll() {
    return await Example.find().sort({ createdAt: -1 });
  }

  static async getById(id) {
    return await Example.findById(id);
  }

  static async create(data) {
    return await Example.create(data);
  }

  static async update(id, data) {
    return await Example.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id) {
    return await Example.findByIdAndDelete(id);
  }
}

module.exports = ExampleService;
