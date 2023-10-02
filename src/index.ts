import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from 'azle';
import { v4 as uuidv4 } from 'uuid';

type ExplorationData = Record<{
    id: string;
    rockType: string;
    description: string;
    mineralDeposits: string;
    location: string;  
    createdAt: nat64;
    updatedAt: Opt<nat64>;
}>;

type ExplorationDataPayload = Record<{
    description: string;
    mineralDeposits: string;
    location: string; 
    rockType: string;
}>;

const explorationDataStorage = new StableBTreeMap<string, ExplorationData>(0, 44, 1024);

$query;
export function getExplorationData(): Result<Vec<ExplorationData>, string> {
    return Result.Ok(explorationDataStorage.values());
}

$query;
export function getExplorationDataById(id: string): Result<ExplorationData, string> {
    if (!id) {
        return Result.Err<ExplorationData, string>('ID is required');
    }
    
    return match(explorationDataStorage.get(id), {
        Some: (explorationData) => Result.Ok<ExplorationData, string>(explorationData),
        None: () => Result.Err<ExplorationData, string>(`Exploration data with id=${id} not found`)
    });
}

$update;
export function addExplorationData(payload: ExplorationDataPayload): Result<ExplorationData, string> {
    if (!payload.description || !payload.mineralDeposits || !payload.location || !payload.rockType) {
        return Result.Err<ExplorationData, string>('All fields (description, mineralDeposits, location, rockType) are required');
    }

    const explorationData: ExplorationData = { id: uuidv4(), createdAt: ic.time(), updatedAt: Opt.None, ...payload };
    explorationDataStorage.insert(explorationData.id, explorationData);
    return Result.Ok<ExplorationData, string>(explorationData);
}

$update;
export function updateExplorationData(id: string, payload: ExplorationDataPayload): Result<ExplorationData, string> {
    if (!id) {
        return Result.Err<ExplorationData, string>('ID is required');
    }

    if (!payload.description && !payload.mineralDeposits && !payload.location && !payload.rockType) {
        return Result.Err<ExplorationData, string>('At least one field (description, mineralDeposits, location, rockType) must be provided for update');
    }

    return match(explorationDataStorage.get(id), {
        Some: (explorationData) => {
            const updatedExplorationData: ExplorationData = { ...explorationData, ...payload, updatedAt: Opt.Some(ic.time()) };
            explorationDataStorage.insert(explorationData.id, updatedExplorationData);
            return Result.Ok<ExplorationData, string>(updatedExplorationData);
        },
        None: () => Result.Err<ExplorationData, string>(`Couldn't update exploration data with id=${id}. Exploration data not found`)
    });
}

$update;
export function deleteExplorationData(id: string): Result<ExplorationData, string> {
    if (!id) {
        return Result.Err<ExplorationData, string>('ID is required');
    }

    return match(explorationDataStorage.remove(id), {
        Some: (deletedExplorationData) => Result.Ok<ExplorationData, string>(deletedExplorationData),
        None: () => Result.Err<ExplorationData, string>(`Couldn't delete exploration data with id=${id}. Exploration data not found.`)
    });
}

globalThis.crypto = {
    // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32)

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256)
        }

        return array
    }
}
