const { spawn } = require('child_process');
const fs = require('fs');

const sql = fs.readFileSync('seed.sql', 'utf8');

const child = spawn('npx.cmd', ['-y', '@supabase/mcp-server-supabase@latest'], {
    env: { ...process.env, SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN },
    shell: true
});

let output = '';

child.stdout.on('data', (data) => {
    output += data.toString();
    console.log(`stdout: ${data.toString()}`);
});

child.stderr.on('data', (data) => {
    console.error(`stderr: ${data.toString()}`);
});

// We need to send an initialize request first for MCP servers
const initReq = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test', version: '1.0' }
    }
};

child.stdin.write(JSON.stringify(initReq) + '\n');

// Wait a bit, then call the tool
setTimeout(() => {
    const callReq = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
            name: 'execute_sql',
            arguments: {
                project_id: 'tdcnbwrmxyqtcfsaelau',
                query: sql
            }
        }
    };
    child.stdin.write(JSON.stringify(callReq) + '\n');
}, 5000);

setTimeout(() => {
    child.kill();
    process.exit(0);
}, 20000);
