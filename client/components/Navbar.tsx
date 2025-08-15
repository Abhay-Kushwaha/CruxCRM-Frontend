"use client";
import { Bell, LogOut, Moon, Settings, User, X, ChevronDown, ChevronUp, Sun, SunMedium } from 'lucide-react'
import Link from 'next/link'
import React, { useState, useEffect, useCallback } from 'react' // Import useCallback
import { useTheme } from "next-themes"
import axios from '@/lib/Axios'; // Import axios
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

type Notification = {
  _id: string; // Changed from 'id' to '_id' to match typical MongoDB IDs
  title: string;
  message: string;
  time: string; // Assuming 'time' comes as a string, might need date formatting
  isRead: boolean; // Changed from 'read' to 'isRead' to match API response
  expanded?: boolean;
};

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState<string | null>(null); // Added error state

  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/notification`);
      // Assuming the API returns an array of notifications directly
      const fetchedNotifications: Notification[] = response.data.data.map((notif: any) => ({
        _id: notif._id,
        title: notif.title || 'New Notification', // Add a default title if not present
        message: notif.message,
        time: new Date(notif.createdAt).toLocaleString(), // Use createdAt and format
        isRead: notif.isRead,
        expanded: false, // Initial state for expansion
      }));
      setNotifications(fetchedNotifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchNotifications();
    }
  }, [mounted, fetchNotifications]); // Depend on mounted and fetchNotifications

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await axios.put(`/notification/mark-read/${id}`);
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      // Optionally show a user-friendly error
    }
  };

  const markAllAsRead = async () => {
    try {
      // The API you provided doesn't have a specific "mark-all-read" endpoint.
      // We'll simulate it by calling individual markAsRead for unread ones
      // or if your API has a batch update, use that.
      // For now, let's fetch all unread IDs and mark them.
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
      await Promise.all(unreadIds.map(id => axios.put(`/notification/mark-read/${id}`)));

      // After successful API calls, update local state
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };


  const deleteNotification = async (id: string) => {
    try {
      await axios.delete(`/notification/delete/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
      // Optionally show a user-friendly error
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await axios.delete(`/notification/delete-all`);
      setNotifications([]); // Clear all notifications from state
    } catch (err) {
      console.error("Failed to delete all notifications:", err);
      // Optionally show a user-friendly error
    }
  };

  const toggleExpand = (id: string) => {
    setNotifications(notifications.map(n =>
      n._id === id ? { ...n, expanded: !n.expanded } : n
    ));
  };

  const shouldTruncate = (message: string) => {
    return message.length > 80;
  };

  if (!mounted) {
    return null;
  }

  return (
    <nav className='dark:bg-[#0F172B] backdrop-blur-2xl flex justify-around flex-col sticky z-20 h-16 top-0 shadow-sm dark:border-b-1 dark:border-gray-700'>
      <div className='flex items-center p-2 justify-between gap-4'>
        <SidebarTrigger />
        <div className='flex items-center justify-between gap-4'>

          {/* Notification Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className='w-5 h-5' />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <DropdownMenuLabel className="flex justify-between items-center px-4 py-3">
                <span>Notifications ({notifications.length})</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                    className="text-xs h-6"
                  >
                    Mark all read
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAllNotifications();
                    }}
                    className="text-xs h-6 text-red-500 hover:text-red-600"
                  >
                    Clear all
                  </Button>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Loading notifications...</div>
                ) : error ? (
                  <div className="p-4 text-center text-red-500">{error}</div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-4 text-center text-gray-500">
                    <Bell className="w-8 h-8 mb-2" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification._id} // Use _id here
                      className={`flex flex-col items-start gap-1 p-3 border-b cursor-pointer ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                      onClick={() => markAsRead(notification._id)} // Use _id here
                    >
                      <div className="flex justify-between w-full">
                        <h4 className="font-medium">{notification.title}</h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id); // Use _id here
                          }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="w-full">
                        <p className={`text-sm text-gray-600 dark:text-gray-300 ${!notification.expanded && shouldTruncate(notification.message) ? 'line-clamp-2' : ''}`}>
                          {notification.message}
                        </p>
                        {shouldTruncate(notification.message) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(notification._id); // Use _id here
                            }}
                            className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-1 flex items-center"
                          >
                            {notification.expanded ? (
                              <>
                                <ChevronUp className="w-3 h-3 mr-1" />
                                See Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3 mr-1" />
                                See More
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{notification.time}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </div>

            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/manager/dashboard">Dashboard</Link>

          {/* THEME TOGGLE BUTTON */}
          <div onClick={() => setTheme(prev => prev === "light" ? "dark" : "light")} className="relative flex items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 ease-in-out">
            <button
              className={`relative z-10 px-2 py-1 text-sm rounded-full transition-all duration-300 ease-in-out
                ${theme === 'light' ? 'text-blue-600 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}
            >
              <SunMedium className='w-5' />
            </button>
            <button
              className={`relative z-10 px-2 py-1 text-sm rounded-full transition-all duration-300 ease-in-out
                ${theme === 'dark' ? 'text-blue-600 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}
            >
              <Moon className='w-5' />
            </button>
            <div className={`absolute top-0.5 bottom-0.5 w-[calc(50%-1px)] rounded-full bg-white dark:bg-gray-800 shadow-md transition-transform duration-300 ease-in-out
              ${theme === 'dark' ? 'translate-x-full' : 'translate-x-0'} `}></div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;