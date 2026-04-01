const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findControllers(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findControllers(fullPath, fileList);
        } else if (fullPath.endsWith('.controller.ts')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

const controllers = findControllers(srcDir);
const rolesToEndpoints = {
    'ADMIN': [],
    'ADVISOR': [],
    'STUDENT': [],
    'COMMON/NO_ROLE': []
};

for (const file of controllers) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Extract base path for controller
    const controllerMatch = content.match(/@Controller\(['"]([^'"]+)['"]\)/);
    const basePath = controllerMatch ? controllerMatch[1] : '';

    // Regex to find methods with their decorators
    // We match @Get, @Post, @Patch, @Delete, @Put and optionally @Roles
    
    // Split by method declarations (roughly)
    const methodBlocks = content.split(/\s+async\s+|\s+public\s+async\s+|\s+async\s+\w+\(/).slice(1);
    
    // Better way: regex across multiple lines to find decorators right before method signature
    const methodRegex = /(@(?:Get|Post|Put|Patch|Delete)\((?:['"]([^'"]*)['"])?\))[\s\S]*?(?:@Roles\(([^)]+)\))?[\s\S]*?(?:async\s+(\w+))/g;
    
    // Let's use a simpler parser
    // We look for every HTTP method decorator in the file
    let m;
    const httpRegex = /@(Get|Post|Put|Patch|Delete)\((['"]([^'"]*)['"])?\)/gi;

    // To link decorators to methods, we can just scan line by line or find the closest preceding @Roles
    const lines = content.split('\n');
    let currentRoles = null;
    let pendingRoles = null;
    
    // Controller-level role?
    const controllerRoleMatch = content.match(/@Controller[^]*?export\s+class/s);
    if (controllerRoleMatch && controllerRoleMatch[0].includes('@Roles(')) {
        const rMatch = controllerRoleMatch[0].match(/@Roles\(([^)]+)\)/);
        if (rMatch) currentRoles = rMatch[1].replace(/['"]/g, '').split(',').map(s => s.trim());
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        const rMatch = line.match(/@Roles\(([^)]+)\)/);
        if (rMatch) {
             pendingRoles = rMatch[1].replace(/['"]/g, '').split(',').map(s => s.trim());
        }
        
        const httpMatch = line.match(/@(Get|Post|Put|Patch|Delete)\((['"]([^'"]*)['"])?\)/);
        if (httpMatch) {
             const method = httpMatch[1].toUpperCase();
             const subPath = httpMatch[3] || '';
             
             let finalPath = `/${basePath}`;
             if (subPath) {
                 finalPath += `/${subPath}`;
             }
             finalPath = finalPath.replace(/\/\//g, '/'); // cleanup double slashes
             
             const roles = pendingRoles || currentRoles || ['COMMON/NO_ROLE'];
             
             // Extract function name, usually on the next line or same line
             let funcName = 'Unknown';
             for (let j = i; j < i + 5 && j < lines.length; j++) {
                 const fMatch = lines[j].match(/async\s+([a-zA-Z0-9_]+)\s*\(/);
                 if (fMatch) {
                     funcName = fMatch[1];
                     break;
                 }
             }
             
             for (const r of roles) {
                 if (!rolesToEndpoints[r]) rolesToEndpoints[r] = [];
                 rolesToEndpoints[r].push({
                     name: `${method} ${finalPath} (${funcName})`,
                     request: {
                         method: method,
                         header: [{ key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }],
                         url: {
                             raw: `{{base_url}}${finalPath.replace(/:([a-zA-Z]+)/g, '{{$1}}')}`,
                             host: ['{{base_url}}'],
                             path: finalPath.split('/').filter(p => p).map(p => p.startsWith(':') ? `{{${p.substring(1)}}}` : p)
                         }
                     }
                 });
             }
             
             pendingRoles = null; // reset
        }
    }
}

// Build postman collection
const collection = {
    info: {
        name: "Project Manager API by Roles",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: [],
    variable: [
        {
            key: "base_url",
            value: "http://localhost:4000",
            type: "string"
        },
        {
            key: "token",
            value: "your_jwt_token_here",
            type: "string"
        }
    ]
};

for (const [role, endpoints] of Object.entries(rolesToEndpoints)) {
    if (endpoints.length > 0) {
        collection.item.push({
            name: `Role: ${role}`,
            item: endpoints
        });
    }
}

fs.writeFileSync(path.join(__dirname, 'postman_collection.json'), JSON.stringify(collection, null, 2));
console.log('Generated postman_collection.json');
