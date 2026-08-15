const fs = require('fs');

function applyTo(file, changes) {
    let content = fs.readFileSync(file, 'utf8');
    changes.forEach(([search, replace]) => {
        content = content.replace(search, replace);
    });
    fs.writeFileSync(file, content);
}

applyTo('server/src/modules/complaint/complaint.controller.js', [
    ['const karmaService = require("../../shared/services/karma.service");',
        'const karmaService = require("../../shared/services/karma.service");\nconst { broadcastGlobal } = require("../../socket");'],
    ['res.status(201).json(complaint);',
        'broadcastGlobal("feed:update");\n    res.status(201).json(complaint);']
]);

applyTo('server/src/modules/complaint/complaint.admin.controller.js', [
    ['const { notifyCitizen } = require("../../socket");',
        'const { notifyCitizen, broadcastGlobal } = require("../../socket");'],
    ['notifyCitizen(complaint.citizen, "notification:new");',
        'notifyCitizen(complaint.citizen, "notification:new");\n    broadcastGlobal("feed:update");']
]);

applyTo('server/src/modules/complaint/employeeComplaint.controller.js', [
    ['const { notifyCitizen } = require("../../socket");',
        'const { notifyCitizen, broadcastGlobal } = require("../../socket");'],
    ['notifyCitizen(complaint.citizen.toString(), "notification:new");',
        'notifyCitizen(complaint.citizen.toString(), "notification:new");\n    broadcastGlobal("feed:update");']
]);

applyTo('client/src/pages/PublicFeedPage.jsx', [
    ['import { useNavigate } from "react-router-dom";',
        'import { useNavigate } from "react-router-dom";\nimport { connectSocket } from "../services/socket";'],
    ['fetchComplaints();\n  }, [selectedCategory',
        'fetchComplaints();\n    const socket = connectSocket();\n    if (socket) {\n      socket.on("feed:update", () => {\n        fetchComplaints();\n      });\n      return () => socket.off("feed:update");\n    }\n  }, [selectedCategory']
]);

console.log('Scripts Applied!');
