import os

filepath = 'backend/src/main/java/com/eggscan/controller/ScanController.java'
with open(filepath, 'r') as f:
    content = f.read()

search_text = """        if ("torvalds".equalsIgnoreCase(username)) {
            ScanResponse easterEgg = ScanResponse.builder()
                    .username("torvalds")
                    .eggVerdict("Golden Egg")
                    .eggScore(100)
                    .firstImpression("Wait, are you actually Linus? *bows down*")
                    .vibe("Literal God Tier. Creator of Git and Linux.")
                    .skills(java.util.List.of("C", "Kernel", "Git", "Yelling at developers on mailing lists"))
                    .build();
            return ResponseEntity.ok(easterEgg);
        }"""

replace_text = """        if ("torvalds".equalsIgnoreCase(username)) {
            ScanResponse easterEgg = ScanResponse.builder()
                    .username("torvalds")
                    .eggVerdict("Golden Egg")
                    .eggScore(100)
                    .firstImpression("Wait, are you actually Linus? *bows down*")
                    .vibe("Literal God Tier. Creator of Git and Linux.")
                    .skills(java.util.List.of("C", "Kernel", "Git", "Yelling at developers on mailing lists"))
                    .build();
            return ResponseEntity.ok(easterEgg);
        }

        if ("defunkt".equalsIgnoreCase(username)) {
            ScanResponse easterEgg = ScanResponse.builder()
                    .username("defunkt")
                    .eggVerdict("Golden Egg")
                    .eggScore(100)
                    .firstImpression("Oh wow, it's one of the founding fathers of GitHub.")
                    .vibe("Tech Royalty. The literal reason we have this site.")
                    .skills(java.util.List.of("Ruby", "Building empires", "Pioneering the modern web"))
                    .build();
            return ResponseEntity.ok(easterEgg);
        }"""

if search_text in content:
    content = content.replace(search_text, replace_text)
    with open(filepath, 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Search text not found")
