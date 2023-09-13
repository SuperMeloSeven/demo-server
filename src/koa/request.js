const Koa = require('koa')
const Router = require('koa-router')
const websockify = require('koa-websocket')
const cors = require('koa2-cors')
const { koaBody } = require('koa-body');

const app = new Koa();

// 使用 koa-body 中间件来处理请求体数据
app.use(koaBody());


// 使用koa2-cors中间件解决跨域
app.use(cors())

const router = new Router()

//  使用 koa-websocket 将应用程序升级为 WebSocket 应用程序
const appWebSocket = websockify(app)

// webSocket
appWebSocket.ws.use((ctx, next) => {
  const path = ctx.request.path;

  if (path === '/webSocketService') {
    // 处理连接关闭事件
    ctx.websocket.on('close', () => {
      console.log('连接已关闭')
    })

    ctx.websocket.on('message', (data) => {
      console.log('Received message:', data)
      // 处理客户端发送的消息，并发送响应
      ctx.websocket.send('Received: ' + data)
    })

    ctx.websocket.on('error', (err) => {
      console.error('WebSocket error:', err)
    })

    // 在建立连接时发送一条消息
    ctx.websocket.send('Welcome to the WebSocket server!')

    return next(ctx)
  } else if (path === '/otherWebSocketService') {
    // 处理 /otherWebSocketService 路径的 WebSocket 连接
  }
})


// xhr
router.post('/api/xhr', (ctx) => {
	ctx.body = 'I am xhr!'
})
// fetch
router.get('/api/fetch', (ctx) => {
	ctx.body = 'I am fetch!'
})
// beacon
router.post('/api/beacon', (ctx) => {
	const data = ctx.request.body
	console.log('打印***data', data)
	ctx.body = 'I am beacon!'
})
// sse
router.get('/api/sse', (ctx) => {
	ctx.respond = false
	ctx.res.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		Connection: "keep-alive",
	});

	// 发送初始事件数据
	ctx.res.write(`data: I am sse!\n\n`);

	// 定期发送事件数据
	setInterval(() => {
		ctx.res.write(`data: This is a SSE message at ${new Date().toISOString()}\n\n`);
	}, 1000);
})

// 将路由注册到应用程序
appWebSocket.use(router.routes()).use(router.allowedMethods())

// 启动服务器
appWebSocket.listen(3000, () => {
	console.log('Server started on port 3000')
})