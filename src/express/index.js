const express = require('express');
const expressWs = require('express-ws');

// 创建Express实例和WebSocket实例
const app = express();
const wsInstance = expressWs(app);

// 在指定URL上建立WebSocket连接
app.ws('/webSocket/cardService/666', (ws, req) => {
  ws.on('message', (message) => {
    // 处理接收到的消息
    console.log('Received:', message);

    const response = {
      errorCode: '-2'
    }
    // 发送消息给客户端
    ws.send(JSON.stringify(response));
  });

  ws.on('close', () => {
    // 执行一些清理逻辑
    console.log('WebSocket connection closed');
  });

  ws.send(JSON.stringify({
    code: 1,
    data: {
      roomNo: '101'
    }
  }));
});

// 启动Express服务器
app.listen(9081, () => {
  console.log('WebSocket server listening on port 9081');
});
