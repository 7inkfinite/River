import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

/**
 * HorizontalCardCarousel - Displays one card at a time with navigation
 *
 * Features:
 * - Shows only ONE card visible at a time
 * - Prev/Next navigation buttons
 * - Keyboard navigation (← →)
 * - Swipe gesture support on mobile
 * - Dot indicators showing current position
 * - Smooth transitions between cards
 */

interface HorizontalCardCarouselProps {
    cards: React.ReactNode[]
    initialIndex?: number
    navigationDisabled?: boolean // When true, grey out nav arrows (e.g., during tweak mode)
}

export function HorizontalCardCarousel({
    cards,
    initialIndex = 0,
    navigationDisabled = false,
}: HorizontalCardCarouselProps) {
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex)
    const [touchStart, setTouchStart] = React.useState<number | null>(null)
    const [touchEnd, setTouchEnd] = React.useState<number | null>(null)
    const [windowWidth, setWindowWidth] = React.useState(
        typeof window !== "undefined" ? window.innerWidth : 1200
    )

    React.useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth)
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const isMobile = windowWidth < 640

    const cardCount = cards.length
    const safeIndex = Math.max(0, Math.min(currentIndex, cardCount - 1))

    // Minimum swipe distance (in px) to trigger a card change
    const minSwipeDistance = 50

    // Navigate to specific index
    const goToIndex = React.useCallback(
        (index: number) => {
            const newIndex = Math.max(0, Math.min(index, cardCount - 1))
            setCurrentIndex(newIndex)
        },
        [cardCount]
    )

    // Navigate to previous card
    const goToPrev = React.useCallback(() => {
        goToIndex(safeIndex - 1)
    }, [goToIndex, safeIndex])

    // Navigate to next card
    const goToNext = React.useCallback(() => {
        goToIndex(safeIndex + 1)
    }, [goToIndex, safeIndex])

    // Keyboard navigation (disabled when navigationDisabled)
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (navigationDisabled) return
            if (e.key === "ArrowLeft") {
                e.preventDefault()
                goToPrev()
            } else if (e.key === "ArrowRight") {
                e.preventDefault()
                goToNext()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [goToPrev, goToNext, navigationDisabled])

    // Touch handlers for swipe gestures
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null)
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd || navigationDisabled) return

        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance

        if (isLeftSwipe) {
            goToNext()
        } else if (isRightSwipe) {
            goToPrev()
        }

        setTouchStart(null)
        setTouchEnd(null)
    }

    if (cardCount === 0) {
        return null
    }

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 20,
            }}
        >
            {/* Main layout: Nav Arrow - Card - Nav Arrow */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                    width: "100%",
                }}
            >
                {/* Left Nav Arrow - hidden on mobile (swipe to navigate) */}
                {!isMobile && (
                    <div
                        style={{
                            flexShrink: 0,
                            width: 60,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        {safeIndex > 0 && (
                            <NavigationButton
                                direction="prev"
                                onClick={goToPrev}
                                disabled={navigationDisabled}
                            />
                        )}
                    </div>
                )}

                {/* Cards Container - centered with fixed height */}
                <div
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    style={{
                        position: "relative",
                        flex: 1,
                        minHeight: 520,
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        overflow: "clip" as any,
                    }}
                >
                    {/* Render all cards but only show the current one */}
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            style={{
                                position: index === safeIndex ? "relative" : "absolute",
                                width: "100%",
                                maxWidth: 720,
                                opacity: index === safeIndex ? 1 : 0,
                                transform: `translateX(${(index - safeIndex) * 100}%)`,
                                transition:
                                    "opacity 400ms cubic-bezier(0.25,0.1,0.25,1), transform 400ms cubic-bezier(0.25,0.1,0.25,1)",
                                pointerEvents: index === safeIndex ? "auto" : "none",
                            }}
                        >
                            {card}
                        </div>
                    ))}
                </div>

                {/* Right Nav Arrow - hidden on mobile (swipe to navigate) */}
                {!isMobile && (
                    <div
                        style={{
                            flexShrink: 0,
                            width: 60,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        {safeIndex < cardCount - 1 && (
                            <NavigationButton
                                direction="next"
                                onClick={goToNext}
                                disabled={navigationDisabled}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Dot Indicators */}
            {cardCount > 1 && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 12,
                        padding: "8px 0",
                    }}
                >
                    {cards.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => !navigationDisabled && goToIndex(index)}
                            disabled={navigationDisabled}
                            aria-label={`Go to card ${index + 1}`}
                            style={{
                                width: index === safeIndex ? 32 : 10,
                                height: 10,
                                borderRadius: 999,
                                border: "none",
                                backgroundColor:
                                    index === safeIndex
                                        ? "#117E8A"
                                        : "rgba(124, 138, 17, 0.25)",
                                cursor: navigationDisabled ? "not-allowed" : "pointer",
                                transition:
                                    "all 300ms cubic-bezier(0.25,0.1,0.25,1)",
                                padding: 0,
                                opacity: navigationDisabled ? 0.4 : 1,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Card Counter */}
            <div
                style={{
                    textAlign: "center",
                    fontSize: 14,
                    color: "#7A7A7A",
                    fontFamily:
                        "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
            >
                {safeIndex + 1} / {cardCount}
            </div>
        </div>
    )
}

/**
 * NavigationButton - Prev/Next button for carousel
 */
interface NavigationButtonProps {
    direction: "prev" | "next"
    onClick: () => void
    disabled?: boolean
}

function NavigationButton({
    direction,
    onClick,
    disabled = false,
}: NavigationButtonProps) {
    const [hover, setHover] = React.useState(false)
    const [pressed, setPressed] = React.useState(false)

    const Icon = direction === "prev" ? ChevronLeft : ChevronRight
    const label = direction === "prev" ? "Previous card" : "Next card"

    // Figma: warm beige palette with teal icon
    const backgroundColor = disabled
        ? "rgba(226, 208, 162, 0.3)"
        : pressed
            ? "#D4C48E"
            : hover
                ? "#E3D49E"
                : "#F3F1EA"

    const iconColor = disabled ? "rgba(47, 47, 47, 0.3)" : "#117E8A"

    return (
        <button
            onClick={disabled ? undefined : onClick}
            onMouseEnter={() => !disabled && setHover(true)}
            onMouseLeave={() => {
                setHover(false)
                setPressed(false)
            }}
            onMouseDown={() => !disabled && setPressed(true)}
            onMouseUp={() => setPressed(false)}
            disabled={disabled}
            aria-label={label}
            title={disabled ? "Navigation disabled" : label}
            style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "none",
                backgroundColor,
                boxShadow: disabled ? "none" : "0px 0px 4px rgba(84, 60, 31, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: disabled ? "not-allowed" : "pointer",
                zIndex: 10,
                transition:
                    "background-color 300ms cubic-bezier(0.25,0.1,0.25,1), box-shadow 300ms cubic-bezier(0.25,0.1,0.25,1), opacity 300ms ease",
                opacity: disabled ? 0.5 : 1,
            }}
        >
            <Icon size={24} color={iconColor} strokeWidth={2.5} />
        </button>
    )
}
