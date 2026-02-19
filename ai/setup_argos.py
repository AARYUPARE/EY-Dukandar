import argostranslate.package

print("Downloading language models...")

argostranslate.package.update_package_index()
available_packages = argostranslate.package.get_available_packages()

# Hindi → English
hi_en = next(p for p in available_packages if p.from_code == "hi" and p.to_code == "en")

# English → Hindi
en_hi = next(p for p in available_packages if p.from_code == "en" and p.to_code == "hi")

argostranslate.package.install_from_path(hi_en.download())
argostranslate.package.install_from_path(en_hi.download())

print("Done!")
