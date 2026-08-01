import { io } from 'socket.io-client';

// สร้างการเชื่อมต่อแค่ "ครั้งเดียว" และเปิดทิ้งไว้ใช้ได้ทั้งแอป
export const socket = io();