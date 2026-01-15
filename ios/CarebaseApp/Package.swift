// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CarebaseApp",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "CarebaseApp",
            targets: ["CarebaseApp"]
        ),
    ],
    dependencies: [
        // No external dependencies - using native SwiftUI
    ],
    targets: [
        .target(
            name: "CarebaseApp",
            dependencies: []
        ),
    ]
)
