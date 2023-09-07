const Koa = require('koa');
const Router = require('koa-router');
const websockify = require('koa-websocket');

// 创建Koa实例和Router实例
const app = websockify(new Koa());
const router = new Router();

// 在指定URL上建立WebSocket连接
router.get('/webSocket/cardService/666', function (ctx) {
  ctx.websocket.on('message', (message) => {
    // 处理接收到的消息
    console.log('Received:', message);

    const response = {
      errorCode: '-2'
    }
    // 发送消息给客户端
    ctx.websocket.send(JSON.stringify(response));
  });

  ctx.websocket.on('close', () => {
    // 执行一些清理逻辑
    console.log('WebSocket connection closed');
  });

  ctx.websocket.send(JSON.stringify({
    code: 1,
    data: {
      roomNo: '101'
    }
  }));

  // 必须执行handshake()方法来建立WebSocket连接
  return ctx.websocket.handshake();
});

// 将路由与应用程序关联
app.ws.use(router.routes());

// 启动Koa服务器
app.listen(9081, () => {
  console.log('WebSocket server listening on port 9081');
});