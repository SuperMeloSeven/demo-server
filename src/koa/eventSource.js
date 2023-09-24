const Koa = require('koa');
const Router = require('koa-router');
const cors = require('@koa/cors')
const { exec } = require('child_process');

const { PassThrough, Readable } = require('stream');

const app = new Koa();
const router = new Router();

router.get('/events', async (ctx) => {
    ctx.request.socket.setTimeout(0);
    ctx.req.socket.setNoDelay(true);
    ctx.req.socket.setKeepAlive(true);
    ctx.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    const stream = new PassThrough();
    ctx.status = 200;
    ctx.body = stream;

    setInterval(() => {
      stream.write(`data: ${new Date()}\n\n`);
    }, 1000);
});


// 创建可读流以追踪日志
const createLogStream = () => {
  const childProcess = exec('tail -f ./src/koa/log');
  const logStream = new Readable({
    read() {}
  });

  // 将子进程的标准输出管道到日志流中
  childProcess.stdout.on('data', (msg) => {
    logStream.push(msg.toString());
  });

  // 处理连接关闭时的清理
  logStream.cleanup = () => {
    logStream.destroy();
    childProcess.kill();
  };

  return logStream;
};
// 定义路由处理程序
router.get('/stream-log', async (ctx) => {
  // 设置响应头为 text/event-stream
  ctx.set('Content-Type', 'text/event-stream');
  ctx.set('Cache-Control', 'no-cache');
  ctx.set('Connection', 'keep-alive');

  // 创建日志流
  const logStream = createLogStream();

  // 监听连接关闭事件以进行清理
  ctx.req.on('close', () => {
    logStream.cleanup();
  });

  const stream = new PassThrough();
  ctx.status = 200;
  ctx.body = stream;

  // 发送日志数据到客户端
  logStream.on('data', (msg) => {
    console.log(msg.toString(), '---msg');
    const lines = msg.toString().split('\n');
    ctx.status = 200;
    ctx.res.write(`data: ${lines}\n\n`);
    // 添加延迟，以便 EventSource 有时间接收和处理每一行
    setTimeout(() => {
      ctx.res.flushHeaders();
    }, 100);
  });
});



app.use(cors());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);


console.log('Server is running at http://localhost:3000');
