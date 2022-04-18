import { Client } from 'faunadb';

const KEY = process.env.FAUNADB_KEY ? process.env.FAUNADB_KEY : '';

export const fauna = new Client({ secret: KEY });
