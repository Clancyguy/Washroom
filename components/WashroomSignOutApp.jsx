'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

export default function WashroomSignOutApp() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [password, setPassword] = useState("");
  const [studentList, setStudentList] = useState([]);
  const [rawList, setRawList] = useState("");
  const [savedLogs, setSavedLogs] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStudents = localStorage.getItem('students');
      const savedStudentList = localStorage.getItem('studentList');
      setStudents(savedStudents ? JSON.parse(savedStudents) : []);
      setStudentList(savedStudentList ? JSON.parse(savedStudentList) : []);

      const logs = Object.keys(localStorage)
        .filter(key => key.startsWith('log-'))
        .map(key => ({ key, date: key.replace('log-', '') }))
        .sort((a, b) => b.date.localeCompare(a.date));
      setSavedLogs(logs);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('students', JSON.stringify(students));
    }
  }, [students]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('studentList', JSON.stringify(studentList));
    }
  }, [studentList]);

  const handleSignOut = (selectedName) => {
    const timestamp = new Date().toISOString();
    const updatedList = [{ name: selectedName, status: 'out', time: timestamp }, ...students];
    setStudents(updatedList);
  };

  const handleSignIn = (index) => {
    const updatedList = [...students];
    updatedList[index].status = 'in';
    updatedList[index].time = new Date().toISOString();
    setStudents(updatedList);
  };

  const handleClear = () => {
    setStudents([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('students');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Status', 'Time'];
    const rows = students.map(s => [s.name, s.status, new Date(s.time).toLocaleString()]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "washroom_signout_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveDayLog = () => {
    const today = new Date().toISOString().split('T')[0];
    const key = `log-${today}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(students));
      alert("Today's log has been saved!");
      const newLogs = [...savedLogs, { key, date: today }];
      setSavedLogs(newLogs);
    }
  };

  const handleLoadLog = (key) => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        setStudents(JSON.parse(savedData));
      }
    }
  };

  const handleSaveStudentList = () => {
    const list = rawList.split("\n").map(n => n.trim()).filter(Boolean);
    setStudentList(list);
    setRawList("");
  };

  const getTimeElapsed = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="fixed inset-0 p-4 sm:p-6 max-w-4xl mx-auto overflow-auto bg-gray-50">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">Washroom Sign Out</h1>

      {!adminMode && studentList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
          {studentList.map((student, idx) => (
            <Button className="py-4 text-lg" key={idx} onClick={() => handleSignOut(student)}>{student}</Button>
          ))}
        </div>
      )}

      {!adminMode && studentList.length === 0 && (
        <div className="mb-6 text-red-500 text-center text-lg">No student list loaded. Please ask the teacher to enter names.</div>
      )}

      {!adminMode && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center items-center">
          <Input
            type="password"
            placeholder="Teacher Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full sm:w-auto"
          />
          <Button className="px-6 py-3 text-base" onClick={() => {
            if (password === "admin123") setAdminMode(true);
          }}>Enter Admin Mode</Button>
        </div>
      )}

      {adminMode && (
        <div className="mb-6">
          <Textarea
            placeholder="Enter student names, one per line"
            value={rawList}
            onChange={(e) => setRawList(e.target.value)}
            className="mb-3 min-h-[120px]"
          />
          <div className="flex flex-wrap gap-2 mb-3">
            <Button onClick={handleSaveStudentList}>Save Student List</Button>
            <Button variant="destructive" onClick={handleClear}>Clear All</Button>
            <Button onClick={handleExportCSV}>Export CSV</Button>
            <Button onClick={handleSaveDayLog}>Save Today's Log</Button>
            <Button onClick={() => setAdminMode(false)}>Exit Admin Mode</Button>
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Saved Logs</h2>
            <div className="flex flex-wrap gap-2">
              {savedLogs.map(log => (
                <Button key={log.key} onClick={() => handleLoadLog(log.key)}>
                  {log.date}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {students.map((student, index) => (
          <Card key={index} className="bg-white shadow rounded-2xl p-4">
            <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <p className="font-medium text-lg">{student.name}</p>
                <p className="text-sm text-gray-500">
                  {student.status === 'out' ? 'Signed out at' : 'Signed in at'}{' '}
                  {new Date(student.time).toLocaleTimeString()}
                </p>
                {student.status === 'out' && (
                  <p className="text-xs text-blue-500">Out for {getTimeElapsed(student.time)}</p>
                )}
              </div>
              {student.status === 'out' && (
                <Button className="mt-2 sm:mt-0" onClick={() => handleSignIn(index)}>Sign In</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
