import * as THREE from 'three';

export interface HexInteractionHandlers {
    onHover: (hexId: string | null) => void;
    onClick: (hexId: string) => void;
    onDoubleClick: (hexId: string) => void;
}

export class InteractionManager {
    private readonly raycaster = new THREE.Raycaster();
    private readonly pointer = new THREE.Vector2();
    private readonly canvas: HTMLCanvasElement;
    private readonly camera: THREE.Camera;
    private readonly interactiveMeshes: THREE.Mesh[];
    private readonly handlers: HexInteractionHandlers;

    private readonly boundOnPointerMove: (e: PointerEvent) => void;
    private readonly boundOnPointerLeave: () => void;
    private readonly boundOnClick: (e: MouseEvent) => void;
    private readonly boundOnDoubleClick: (e: MouseEvent) => void;

    constructor(
        canvas: HTMLCanvasElement,
        camera: THREE.Camera,
        interactiveMeshes: THREE.Mesh[],
        handlers: HexInteractionHandlers
    ) {
        this.canvas = canvas;
        this.camera = camera;
        this.interactiveMeshes = interactiveMeshes;
        this.handlers = handlers;

        this.boundOnPointerMove = this.handlePointerMove.bind(this);
        this.boundOnPointerLeave = this.handlePointerLeave.bind(this);
        this.boundOnClick = this.handleClick.bind(this);
        this.boundOnDoubleClick = this.handleDoubleClick.bind(this);

        this.canvas.addEventListener('pointermove', this.boundOnPointerMove);
        this.canvas.addEventListener('pointerleave', this.boundOnPointerLeave);
        this.canvas.addEventListener('click', this.boundOnClick);
        this.canvas.addEventListener('dblclick', this.boundOnDoubleClick);
    }

    private raycastHexId(clientX: number, clientY: number): string | null {
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return null;

        this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactiveMeshes, false);

        if (intersects.length === 0) return null;
        return (intersects[0].object.userData?.hexId as string) ?? null;
    }

    private handlePointerMove(event: PointerEvent): void {
        const hexId = this.raycastHexId(event.clientX, event.clientY);
        this.handlers.onHover(hexId);
    }

    private handlePointerLeave(): void {
        this.handlers.onHover(null);
    }

    private handleClick(event: MouseEvent): void {
        const hexId = this.raycastHexId(event.clientX, event.clientY);
        if (hexId) {
            this.handlers.onClick(hexId);
        }
    }

    private handleDoubleClick(event: MouseEvent): void {
        const hexId = this.raycastHexId(event.clientX, event.clientY);
        if (hexId) {
            this.handlers.onDoubleClick(hexId);
        }
    }

    public dispose(): void {
        this.canvas.removeEventListener('pointermove', this.boundOnPointerMove);
        this.canvas.removeEventListener('pointerleave', this.boundOnPointerLeave);
        this.canvas.removeEventListener('click', this.boundOnClick);
        this.canvas.removeEventListener('dblclick', this.boundOnDoubleClick);
    }
}
