// Import necessary modules and dependencies.
import {
  $query,
  $update,
  Record,
  StableBTreeMap,
  Vec,
  match,
  Result,
  nat64,
  ic,
  Opt,
} from "azle";
import { v4 as uuidv4 } from "uuid";

// Define a TypeScript type for ExplorationData record.
type ExplorationData = Record<{
  id: string;
  rockType: string;
  description: string;
  mineralDeposits: string;
  location: string;
  createdAt: nat64;
  updatedAt: Opt<nat64>;
}>;

// Define a TypeScript type for ExplorationData payload.
type ExplorationDataPayload = Record<{
  description: string;
  mineralDeposits: string;
  location: string;
  rockType: string;
}>;

// Create StableBTreeMap instance to store ExplorationData objects.
const explorationDataStorage = new StableBTreeMap<string, ExplorationData>(
  0,
  44,
  1024
);

$query;
// Function to get all exploration data.
export function getAllExplorationData(): Result<Vec<ExplorationData>, string> {
  try {
    const explorationData = explorationDataStorage.values();
    if (!explorationData) {
      console.error(
        "Error fetching exploration data: explorationData is null or undefined"
      );
      return Result.Err("Failed to fetch exploration data");
    }
    return Result.Ok(explorationData);
  } catch (error) {
    console.error("Error fetching exploration data:", error);
    return Result.Err("Failed to fetch exploration data");
  }
}

$query;
// Function to get exploration data by ID.
export function getExplorationDataById(
  id: string
): Result<ExplorationData, string> {
  // Validate id parameter.
  if (!id) {
    return Result.Err<ExplorationData, string>(`invalid id=${id}`);
  }
  try {
    return match(explorationDataStorage.get(id), {
      Some: (explorationData) =>
        Result.Ok<ExplorationData, string>(explorationData),
      None: () =>
        Result.Err<ExplorationData, string>(
          `exploration data with id=${id} not found`
        ),
    });
  } catch (error) {
    return Result.Err("Failed to fetch exploration data");
  }
}

$update;
// Function to add new exploration data.
export function addExplorationData(
  payload: ExplorationDataPayload
): Result<ExplorationData, string> {
  // Validate payload fields.
  if (
    !payload.description ||
    !payload.mineralDeposits ||
    !payload.location ||
    !payload.rockType
  ) {
    return Result.Err<ExplorationData, string>(
      "Missing required fields in payload"
    );
  }

  // Generate a unique ID for the new exploration data.
  const newId = uuidv4();

  // Create a new ExplorationData object.
  const explorationData: ExplorationData = {
    id: newId,
    createdAt: ic.time(),
    updatedAt: Opt.None,
    description: payload.description,
    mineralDeposits: payload.mineralDeposits,
    location: payload.location,
    rockType: payload.rockType,
  };

  try {
    // Insert the new exploration data into storage.
    explorationDataStorage.insert(explorationData.id, explorationData);
    return Result.Ok<ExplorationData, string>(explorationData);
  } catch (error) {
    return Result.Err<ExplorationData, string>(
      `Failed to add exploration data: ${error}`
    );
  }
}

$update;
// Function to update existing exploration data.
export function updateExplorationData(
  id: string,
  payload: ExplorationDataPayload
): Result<ExplorationData, string> {
  // Validate payload fields.
  if (
    !payload.description ||
    !payload.mineralDeposits ||
    !payload.location ||
    !payload.rockType
  ) {
    return Result.Err<ExplorationData, string>(
      "Missing required fields in payload"
    );
  }

  // Ensure the ID is not empty.
  if (id === "") {
    return Result.Err<ExplorationData, string>("id cannot be empty");
  }

  return match(explorationDataStorage.get(id), {
    Some: (explorationData) => {
      // Create an updated exploration data object.
      const updatedExplorationData: ExplorationData = {
        ...explorationData,
        description: payload.description,
        mineralDeposits: payload.mineralDeposits,
        location: payload.location,
        rockType: payload.rockType,
        updatedAt: Opt.Some(ic.time()),
      };
      try {
        // Update the exploration data in storage.
        explorationDataStorage.insert(
          explorationData.id,
          updatedExplorationData
        );
        return Result.Ok<ExplorationData, string>(updatedExplorationData);
      } catch (error) {
        return Result.Err<ExplorationData, string>(
          `Error updating exploration data: ${error}`
        );
      }
    },
    None: () =>
      Result.Err<ExplorationData, string>(
        `Exploration data with id=${id} not found`
      ),
  });
}

$update;
// Function to delete exploration data by ID.
export function deleteExplorationData(
  id: string
): Result<ExplorationData, string> {
  return match(explorationDataStorage.remove(id), {
    Some: (deletedExplorationData) =>
      Result.Ok<ExplorationData, string>(deletedExplorationData),
    None: () =>
      Result.Err<ExplorationData, string>(
        `Couldn't delete exploration data with id=${id}. Exploration data not found.`
      ),
  });
}

// Define a global crypto object with a getRandomValues method.
globalThis.crypto = {
  // @ts-ignore
  getRandomValues: () => {
    let array = new Uint8Array(32);

    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }

    return array;
  },
};
