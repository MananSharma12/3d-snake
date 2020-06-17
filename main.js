let scene, camera, renderer, width = window.innerWidth, height = window.innerHeight, controls, clock = new THREE.Clock()

const snake = [], cube = new THREE.BoxGeometry(1, 1, 1)
const speedVal = document.getElementById('speed'), sliderVal = document.getElementById('slider')

console.log(sliderVal.value)

let freq, theta = 0.0, BodyColor = 0xffe83c, HeadColor = 0x0000FF

const lightPos = [new THREE.Vector3(0, 50, 20), new THREE.Vector3(0, 15, -20), new THREE.Vector3(-20, 15, 20), new THREE.Vector3(20, -15, 0)];
const edgeSize = 25, cubeSize = 26, halfCube = cubeSize / 2

let direction = new THREE.Vector3(1, 0, 0), finish = false, keys = [], score = 0

const gameCube = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)

let scoreDiv = document.createElement('div')

scoreDiv.innerHTML = `Score: ${score}`

let black1, black2

const init = () => {
    scene = new THREE.Scene()

    scene.background = new THREE.Color(0x81eef1)
    aspectRatio = width / height

    camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000)
    cube.center()
    camera.position.set(0, 40, 40)

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    document.body.appendChild(renderer.domElement)

    lightPos.forEach(v => {
        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(v.x, v.y, v.z)
        scene.add(light)
    })

    for (let i = 0; i < 5; i++) {
        let snakeCubeMaterial = new THREE.MeshPhongMaterial({ color: (i == 4) ? HeadColor : BodyColor })
        snake.push(new createCube(cube, snakeCubeMaterial, new THREE.Vector3(i - halfCube + 0.5, 0.5, 0.5), scene, false))
    }

    food = new createSphere(new THREE.SphereGeometry(.5, 32, 32), new THREE.MeshPhongMaterial({ color: 0xc62828 }), foodLocation(), scene)

    black1 = new createCube(cube, new THREE.LineBasicMaterial({ color: 0x000000 }), new THREE.Vector3(1.5, 1.5, 1.5), scene, false)
    black2 = new createCube(cube, new THREE.LineBasicMaterial({ color: 0x000000 }), new THREE.Vector3(7.5, 7.5, 7.5), scene, false)

    new createCube(gameCube, new THREE.LineBasicMaterial({ color: 0xffffff }), new THREE.Vector3(0, 0, 0), scene, true).setPosition(0, 0, 0)

    controls = new THREE.OrbitControls(camera, renderer.domElement)

    controls.enableKeys = false;
    scoreDiv.style.position = "absolute";
    scoreDiv.style.width = 200;
    scoreDiv.style.height = 100;
    scoreDiv.style.top = `${20}px`;
    scoreDiv.style.left = `${20}px`;
    scoreDiv.style.fontSize = `${50}px`;
    document.body.appendChild(scoreDiv)
}

const createSphere = function (geometry, material, vector, scene) {
    this.mesh = new THREE.Mesh(geometry, material)
    scene.add(this.mesh)
    this.mesh.position.set(vector.x, vector.y, vector.z)
    this.setPosition = vector => {
        this.mesh.position.set(vector.x, vector.y, vector.z)
    }
}

const createCube = function (geometry, material, vector, scene, wireFrame = true) {
    this.mesh = new THREE.Mesh(geometry, material)
    if (!wireFrame) {
        this.mesh.position.set(vector.x, vector.y, vector.z)
        scene.add(this.mesh)
    }
    else {
        scene.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), material));
    }
    this.setPosition = (vector) => {
        this.mesh.position.set(vector.x, vector.y, vector.z)
    }
}

const restart = () => {
    while (snake.length > 5)
        scene.remove(snake.shift().mesh)
    for (let i = 0; i < snake.length; i++) {
        snake[i].setPosition(i - halfCube + 0.5, 0.5, 0.5)
    }
    score = 0
    scoreDiv.innerHTML = `Score: ${score}`
    finish = false;
    direction = new THREE.Vector3(0, 0, 1)
}

const foodLocation = () => {
    const x = 0 + Math.floor((edgeSize - 0) * Math.random())
    const y = 0 + Math.floor((edgeSize - 0) * Math.random())
    const z = 0 + Math.floor((edgeSize - 0) * Math.random())
    return new THREE.Vector3(x - halfCube + 0.5, y - halfCube + 0.5, z - halfCube + 0.5)
}

const animate = () => {
    freq = 1 / sliderVal.value
    speedVal.innerHTML = `Speed: ${sliderVal.value}`
    window.requestAnimationFrame(animate)
    theta += clock.getDelta()
    if (theta > freq) {
        let tail = snake.shift(), head = snake[snake.length - 1]
        
        head.mesh.material.color.setHex(BodyColor)
        tail.mesh.material.color.setHex(HeadColor)

        direction = keys.length > 0 ? keys.pop() : direction
        const newDir = new THREE.Vector3(head.mesh.position.x + direction.x, head.mesh.position.y + direction.y, head.mesh.position.z + direction.z)
        tail.setPosition(newDir)
        snake.push(tail)
        head = tail
        for (let i = snake.length - 1; i > -1; i--) {
            if (snake[i].mesh.position.distanceTo(black1.mesh.position) < 1) {
                const nD = new THREE.Vector3(snake[i].mesh.position.x + 6 + direction.x, snake[i].mesh.position.y + 6 + direction.y, snake[i].mesh.position.z + 6 + direction.z)
                snake[i].setPosition(nD)
            }
        }
        for (let i = snake.length - 1; i > -1; i--) {
            if (snake[i].mesh.position.distanceTo(black2.mesh.position) < 1) {
                const nD = new THREE.Vector3(snake[i].mesh.position.x - 6 + direction.x, snake[i].mesh.position.y - 6 + direction.y, snake[i].mesh.position.z - 6 + direction.z)
                snake[i].setPosition(nD)
            }
        }
        for (let i = snake.length - 2; i > -1; i--) {
            if (head.mesh.position.distanceTo(snake[i].mesh.position) < 1) {
                finish = true
                break
            }
        }
        if (finish) {
            console.log('hello')
            restart()
        }
        if (head.mesh.position.distanceTo(food.mesh.position) < 1) {
            food.setPosition(foodLocation())
            score++
            scoreDiv.innerHTML = `Score: ${score}`
            snake.unshift(new createCube(cube, new THREE.MeshPhongMaterial({ color: 0xffffff }), new THREE.Vector3(snake[0].mesh.position.x, snake[0].mesh.position.y, snake[0].mesh.position.z), scene, false))
        }
        if (head.mesh.position.x < -halfCube) {
            head.mesh.position.x = halfCube - 0.5
        }
        else if (head.mesh.position.x > halfCube) {
            head.mesh.position.x = -halfCube + 0.5
        }
        else if (head.mesh.position.y < -halfCube) {
            head.mesh.position.y = halfCube - 0.5
        }
        else if (head.mesh.position.y > halfCube) {
            head.mesh.position.y = -halfCube + 0.5
        }
        else if (head.mesh.position.z < -halfCube) {
            head.mesh.position.z = halfCube - 0.5
        }
        else if (head.mesh.position.z > halfCube) {
            head.mesh.position.z = -halfCube + 0.5
        }
        theta = 0
    }
    renderer.render(scene, camera)
}

init()
animate()

document.addEventListener("keydown", e => {
    switch (e.key) {
    case 'w':
        keys.push(new THREE.Vector3(0, 1, 0))
    break
    case 's':
        keys.push(new THREE.Vector3(0, -1, 0))
    break
    case "ArrowDown":
        keys.push(new THREE.Vector3(0, 0, 1))
    break
    case "ArrowUp":
        keys.push(new THREE.Vector3(0, 0, -1))
    break
    case "ArrowLeft":
        keys.push(new THREE.Vector3(-1, 0, 0))
    break
    case "ArrowRight":
        keys.push(new THREE.Vector3(1, 0, 0))
    break
    }
})
    
window.addEventListener('resize', () => {
    width = window.innerWidth
    height = window.innerHeight
    renderer.setSize(width, height)
    camera.aspect(width / height)
    camera.updateProjectionMatrix()
})