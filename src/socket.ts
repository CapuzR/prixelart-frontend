import { io } from 'socket.io-client';
import { BACKEND_URL } from "./api/utils.api";

const URL = BACKEND_URL || 'http://localhost:8000';

export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true
});