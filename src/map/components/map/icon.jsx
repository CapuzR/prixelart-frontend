import React from "react";


export const Icon = ({ icon, rawMapRef, calculateIconRelation, setSelectedIcon }) => {
    let iconRef = React.useRef(React.createRef());
    let [iconRelatives, setIconRelatives] = React.useState({ size: { x: 0, y: 0 }, position: { x: 0, y: 0 }  });

    const handleIconRelation = () => {

        const originalMapSize = { x: rawMapRef.current?.naturalWidth, y: rawMapRef.current?.naturalHeight };
        const originalIconSize = { x: iconRef.current?.naturalWidth, y: iconRef.current?.naturalHeight };
        console.log(icon.originalCoordinates?.y);
        const originalIconPosition = { x: icon.originalCoordinates?.x, y: icon.originalCoordinates?.y };
        const screenMapSize = { x: rawMapRef.current?.width, y: rawMapRef.current?.height };

        const size = calculateIconRelation(originalMapSize, originalIconSize, screenMapSize);
        const position = calculateIconRelation(originalMapSize,originalIconPosition,screenMapSize);

        setIconRelatives({ size, position });
    };

    const handleClick = (e) => {
        e.preventDefault();
        setSelectedIcon(icon);
    };
    
    React.useEffect(() => {
        handleIconRelation();
    }, []);
    
return (
    <a 
        href="" 
        onClick={handleClick}  
    >
        {
            icon.type === "text" ?
                <div 
                    style={{
                        position: "absolute", 
                        top: iconRelatives.position?.y, 
                        left: iconRelatives.position?.x,
                        fontSize: "0.6rem",
                    }}
                >
                    {icon.text}
                </div>
                :
                <img 
                    alt="icon" 
                    src={icon.src} 
                    ref={iconRef}
                    style={{ 
                        width: iconRelatives.size?.x, 
                        position: "absolute", 
                        top: iconRelatives.position?.y || 0, 
                        left: iconRelatives.position?.x || 0
                    }} 
                />
        }
    </a>
);
};