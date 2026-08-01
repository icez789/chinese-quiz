import React, { createContext, useState, useEffect } from 'react';

// สร้าง Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('arcade_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // เมื่อแอปเปิดขึ้นมา หรือ Token เปลี่ยน ให้ไปเช็คข้อมูลผู้ใช้กับ Backend
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // ถ้า Token หมดอายุหรือพัง ให้เคลียร์ทิ้ง
          logout();
        }
      } catch (err) {
        console.error('Auth Check Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('arcade_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('arcade_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};