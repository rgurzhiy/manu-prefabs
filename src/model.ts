import { uuid } from 'uuidv4';

namespace manu {

    type Guid = string
    
    export class Node {
        uid: Guid
        name: string
        private _children: Node[] = []
        get children() { return this._children }

        constructor(name: string, uid: Guid = uuid()) {
            this.name = name
            this.uid = uid
        }

        load(_: Scene) { }
        unload(_: Scene) { }

        clone(mapping: Mapping) {
            let node = new Node(this.name, mapping.getUuidFrom(this.uid))
            this.children.forEach(child => node.children.push(child.clone(mapping)))
            return node
        }

        add(child: Node, scene: Scene) {
            this.children.push(child)
            child.load(scene)
        }

        remove(index: number, scene: Scene) {
            this.children[index].unload(scene)
            this.children.splice(index, 1)
        }
    }

    export class DynamicNode extends Node {
        pid: Guid
        node?: Node
        get children() { return this.node?.children || [] }

        constructor(name: string, pid: Guid, uid: Guid = uuid()) {
            super(name, uid)
            this.pid = pid
        }

        load(scene: Scene) {
            this.node = scene.pack.prefabs.get(this.pid)?.root.clone(scene.mapping)
            this.children.forEach(child => child.load(scene))
        }

        unload(scene: Scene): void {
            this.children.forEach(child => child.unload(scene))
            this.node = undefined
        }
    }

    export class Prefab {
        root: Node
        constructor(root: Node) {
            this.root = root
        }
    }

    export class ResourcePack {
        prefabs: Map<Guid, Prefab> = new Map()
    }

    export class Mapping {
        getUuidFrom(source: Guid) {
            return uuid()
        }
    }

    export class Scene {
        pack: ResourcePack
        mapping: Mapping

        constructor(pack: ResourcePack) {
            this.pack = pack
            this.mapping = new Mapping()
        }
    }

}

