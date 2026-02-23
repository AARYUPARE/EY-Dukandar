import pandas as pd

# read excel
df = pd.read_excel("storedetails.xlsx")
# convert to json
df.to_json("storedetails.json", orient="records", indent=4)

print("Converted successfully 🚀")