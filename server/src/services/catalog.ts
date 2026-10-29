import { Category, Service } from '../models/index.js';
import {
  discoverCategories,
  vetServices,
  trainingServices,
  groomingServices,
} from '../data/legacy.js';

// Bootstrap only missing catalog records; never replace an administrator's edits.
export async function initializeCatalog() {
  for (const [sortOrder, { id, ...category }] of discoverCategories.entries()) {
    await Category.updateOne(
      { _id: id },
      { $setOnInsert: { ...category, sortOrder } },
      { upsert: true },
    );
  }
  for (const [category, services] of [
    ['veterinarian', vetServices],
    ['training', trainingServices],
    ['grooming', groomingServices],
  ] as const) {
    for (const [sortOrder, { id, ...service }] of services.entries()) {
      await Service.updateOne(
        { _id: id },
        { $setOnInsert: { ...service, category, price: 8500, sortOrder } },
        { upsert: true },
      );
    }
  }
}
