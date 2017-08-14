const stun = require('stun')

const { STUN_BINDING_REQUEST, STUN_ATTR_XOR_MAPPED_ADDRESS } = stun.constants

const server = stun.createServer()
const request = stun.createMessage(STUN_BINDING_REQUEST)

server.once('bindingResponse', (a, b) => {
  console.log('your ip:', a.getAttribute(STUN_ATTR_XOR_MAPPED_ADDRESS).value.address)
  console.log(a, b)

  server.close()
})

server.send(request, 19302, 'localhost')
