
import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Trash2, Download, MousePointer, PenTool, Undo, Palette } from 'lucide-react';

const COLORS = [
    '#000000', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#FFFFFF'
];

const BRUSH_SIZES = [2, 4, 8, 12, 20];

// Define the handle type for parent access
export interface WhiteboardHandle {
    getSnapshot: () => string | null;
}

const Whiteboard = React.forwardRef<WhiteboardHandle, {}>((_, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(4);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

    // Expose method to parent
    React.useImperativeHandle(ref, () => ({
        getSnapshot: () => {
            if (canvasRef.current) {
                return canvasRef.current.toDataURL('image/png');
            }
            return null;
        }
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height); // White background
                setContext(ctx);
            }

            const handleResize = () => {
                if (parent && ctx) {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    canvas.width = parent.clientWidth;
                    canvas.height = parent.clientHeight;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.putImageData(imageData, 0, 0);
                }
            };

            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    useEffect(() => {
        if (context) {
            context.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
            context.lineWidth = brushSize;
        }
    }, [color, brushSize, tool, context]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        // if (!context) return; // Removed to allow drawing to start correctly on first click if context ready
        if (!context) return;
        setIsDrawing(true);
        const { x, y } = getCoordinates(e);
        context.beginPath();
        context.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !context) return;
        const { x, y } = getCoordinates(e);
        context.lineTo(x, y);
        context.stroke();
    };

    const stopDrawing = () => {
        if (!context) return;
        context.closePath();
        setIsDrawing(false);
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const clearCanvas = () => {
        if (context && canvasRef.current) {
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const downloadCanvas = () => {
        if (canvasRef.current) {
            const link = document.createElement('a');
            link.download = `whiteboard-${Date.now()}.png`;
            link.href = canvasRef.current.toDataURL();
            link.click();
        }
    };

    return (
        <div className="h-full flex flex-col bg-stone-100 rounded-2xl overflow-hidden shadow-sm border border-stone-200">
            <div className="bg-white p-4 border-b border-stone-200 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex bg-stone-100 p-1 rounded-lg gap-1">
                        <button
                            onClick={() => setTool('pen')}
                            className={`p-2 rounded-md transition-colors ${tool === 'pen' ? 'bg-white shadow-sm text-indigo-600' : 'text-stone-500 hover:text-stone-700'}`}
                            title="Pen"
                        >
                            <PenTool size={20} />
                        </button>
                        <button
                            onClick={() => setTool('eraser')}
                            className={`p-2 rounded-md transition-colors ${tool === 'eraser' ? 'bg-white shadow-sm text-indigo-600' : 'text-stone-500 hover:text-stone-700'}`}
                            title="Eraser"
                        >
                            <Eraser size={20} />
                        </button>
                    </div>

                    <div className="h-8 w-px bg-stone-200"></div>

                    <div className="flex gap-1">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                onClick={() => { setColor(c); setTool('pen'); }}
                                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c && tool === 'pen' ? 'border-stone-400 scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                                title={c}
                            />
                        ))}
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => { setColor(e.target.value); setTool('pen'); }}
                            className="w-6 h-6 rounded-full overflow-hidden cursor-pointer border-0 p-0"
                        />
                    </div>

                    <div className="h-8 w-px bg-stone-200"></div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-400">SIZE</span>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            value={brushSize}
                            onChange={(e) => setBrushSize(parseInt(e.target.value))}
                            className="w-24 accent-indigo-600"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={clearCanvas} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Clear All">
                        <Trash2 size={20} />
                    </button>
                    <button onClick={downloadCanvas} className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors" title="Download">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 relative bg-white cursor-crosshair touch-none">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="absolute top-0 left-0 w-full h-full block"
                />
            </div>
        </div>
    );
}); // End forwardRef wrapping

export default Whiteboard;
