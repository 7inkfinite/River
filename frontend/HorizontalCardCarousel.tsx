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
}

export function HorizontalCardCarousel({
    cards,
    initialIndex = 0,
}: HorizontalCardCarouselProps) {
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex)
    const [touchStart, setTouchStart] = React.useState<number | null>(null)
    const [touchEnd, setTouchEnd] = React.useState<number | null>(null)

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

    // Keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
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
    }, [goToPrev, goToNext])

    // Touch handlers for swipe gestures
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null)
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return

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
                maxWidth: 880,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: 20,
            }}
        >
            {/* Cards Container */}
            <div
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{
                    position: "relative",
                    width: "100%",
                    minHeight: 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "visible",
                }}
            >
                {/* Render all cards but only show the current one */}
                {cards.map((card, index) => (
                    <div
                        key={index}
                        style={{
                            position: index === safeIndex ? "relative" : "absolute",
                            width: "100%",
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

                {/* Previous Button */}
                {safeIndex > 0 && (
                    <NavigationButton
                        direction="prev"
                        onClick={goToPrev}
                        style={{ left: -60 }}
                    />
                )}

                {/* Next Button */}
                {safeIndex < cardCount - 1 && (
                    <NavigationButton
                        direction="next"
                        onClick={goToNext}
                        style={{ right: -60 }}
                    />
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
                            onClick={() => goToIndex(index)}
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
                                cursor: "pointer",
                                transition:
                                    "all 300ms cubic-bezier(0.25,0.1,0.25,1)",
                                padding: 0,
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
    style?: React.CSSProperties
}

function NavigationButton({
    direction,
    onClick,
    style,
}: NavigationButtonProps) {
    const [hover, setHover] = React.useState(false)
    const [pressed, setPressed] = React.useState(false)

    const Icon = direction === "prev" ? ChevronLeft : ChevronRight
    const label = direction === "prev" ? "Previous card" : "Next card"

    const backgroundColor = pressed
        ? "#0F6B75"
        : hover
          ? "#148A97"
          : "rgba(17, 126, 138, 0.9)"

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => {
                setHover(false)
                setPressed(false)
            }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            aria-label={label}
            title={label}
            style={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "none",
                backgroundColor,
                boxShadow: "0px 4px 12px rgba(17, 126, 138, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10,
                transition:
                    "background-color 300ms cubic-bezier(0.25,0.1,0.25,1), transform 200ms cubic-bezier(0.25,0.1,0.25,1), box-shadow 300ms cubic-bezier(0.25,0.1,0.25,1)",
                ...style,
            }}
        >
            <Icon size={28} color="#EFE9DA" strokeWidth={2.5} />
        </button>
    )
}
