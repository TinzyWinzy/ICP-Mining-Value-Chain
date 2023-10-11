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
export function getExplorationData(page: number, pageSize: number): Result<Vec<ExplorationData>, string> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const dataSlice = explorationDataStorage.values().slice(start, end);

  return Result.Ok(dataSlice);
}

$query;
export function searchExplorationData(query: string): Result<Vec<ExplorationData>, string> {
  const results = explorationDataStorage.values().filter((data) => {
    return (
      data.rockType.includes(query) ||
      data.description.includes(query) ||
      data.mineralDeposits.includes(query) ||
      data.location.includes(query)
    );
  });

  return Result.Ok(results);
}

$query;
export function filterExplorationDataByLocation(location: string): Result<Vec<ExplorationData>, string> {
  const results = explorationDataStorage.values().filter((data) => data.location === location);
  return Result.Ok(results);
}

$query;
export function getExplorationDataById(id: string): Result<ExplorationData, string> {
  return match(explorationDataStorage.get(id), {
    Some: (explorationData) => Result.Ok<ExplorationData, string>(explorationData),
    None: () => Result.Err<ExplorationData, string>(`Exploration data with id=${id} not found`),
  });
}


$update;
export function addExplorationData(payload: ExplorationDataPayload): Result<ExplorationData, string> {
  const explorationData: ExplorationData = { ...payload, id: uuidv4(), createdAt: ic.time(), updatedAt: Opt.None };
  explorationDataStorage.insert(explorationData.id, explorationData);
  return Result.Ok<ExplorationData, string>(explorationData);
}

$update;
export function updateExplorationData(id: string, payload: ExplorationDataPayload): Result<ExplorationData, string> {
  return match(explorationDataStorage.get(id), {
    Some: (explorationData) => {
      const updatedExplorationData: ExplorationData = { ...explorationData, ...payload, updatedAt: Opt.Some(ic.time()) };
      explorationDataStorage.insert(explorationData.id, updatedExplorationData);
      return Result.Ok<ExplorationData, string>(updatedExplorationData);
    },
    None: () => Result.Err<ExplorationData, string>(`Couldn't update exploration data with id=${id}. Exploration data not found`),
  });
}

$update;
export function deleteExplorationData(id: string): Result<ExplorationData, string> {
  return match(explorationDataStorage.remove(id), {
    Some: (deletedExplorationData) => Result.Ok<ExplorationData, string>(deletedExplorationData),
    None: () => Result.Err<ExplorationData, string>(`Couldn't delete exploration data with id=${id}. Exploration data not found.`),
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
