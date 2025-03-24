import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import apiClient from '../api/client';

interface LogViewerProps {
  logPath: string | null;
  isRunning: boolean;
}

const LogViewer: React.FC<LogViewerProps> = ({ logPath, isRunning }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  
  useEffect(() => {
    if (!logPath) return;
    
    console.log(`Setting up SSE connection to log path: ${logPath}`);
    
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // Clear existing logs when starting a new connection
    setLogs([]);
    setError(null);
    setMessageCount(0);
    
    // Get base URL from API client
    const baseURL = apiClient.defaults.baseURL || 'http://localhost:8000';
    
    // Create SSE connection
    const sseUrl = `${baseURL}/reconstruction/stream-logs?log_path=${encodeURIComponent(logPath)}`;
    console.log(`Connecting to SSE URL: ${sseUrl}`);
    
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;
    
    // Set up event handlers
    eventSource.onopen = () => {
      console.log("✅ SSE connection opened");
      setIsConnected(true);
    };
    
    eventSource.onmessage = (event) => {
      setMessageCount(prev => prev + 1);
      console.log(`📩 SSE message #${messageCount+1}: ${event.data.length} chars`);
      
      if (event.data) {
        // Split message into lines and filter out empty ones
        const newLines = event.data
          .split('\n')
          .filter((line: string) => line.trim() !== '');
        
        if (newLines.length > 0) {
          console.log(`Adding ${newLines.length} new lines to log display`);
          setLogs(prev => [...prev, ...newLines]);
        }
      }
    };
    
    eventSource.onerror = (error) => {
      console.error("⚠️ SSE error:", error);
      setIsConnected(false);
      
      if (isRunning) {
        setError("Error in log stream connection");
      } else {
        // If we're not running anymore, just close the connection
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
      }
    };
    
    // Cleanup function
    return () => {
      console.log("Cleaning up SSE connection");
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [logPath]);
  
  // Auto-scroll to the bottom when logs update
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <Paper 
      elevation={3}
      sx={{
        p: 2,
        maxHeight: '400px',
        overflow: 'auto',
        bgcolor: '#1e1e1e',
        color: '#e0e0e0',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        position: 'relative',
        border: '1px solid #89987880',
        borderRadius: '4px',
        boxShadow: 'none'
      }}
    >
      <Typography variant="subtitle2" sx={{ color: '#4fc3f7', mb: 1 }}>
        HTTOMO Log Output
        {isRunning && isConnected && (
          <CircularProgress size={16} sx={{ ml: 1, color: '#4fc3f7' }} />
        )}
        <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', color: '#888' }}>
          {messageCount > 0 ? `(${messageCount} updates)` : ''}
        </Box>
      </Typography>
      
      {error && (
        <Box sx={{ color: '#ff5252', mb: 1 }}>
          {error}
        </Box>
      )}
      
      {logs.length === 0 ? (
        <Box sx={{ textAlign: 'center', color: '#888', py: 2 }}>
          {isRunning ? "Waiting for log data..." : "No log data available, start the reconstruction to see the logs"}
        </Box>
      ) : (
        <Box sx={{ whiteSpace: 'pre-wrap' }}>
          {logs.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
          <div ref={logEndRef} />
        </Box>
      )}
    </Paper>
  );
};

export default LogViewer;