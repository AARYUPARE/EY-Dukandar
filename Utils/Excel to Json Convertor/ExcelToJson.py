import pandas as pd

# read excel
df = pd.read_excel("data.xlsx")
df["category"] = df["category"].str.lower()
df["subCategory"] = df["subCategory"].str.lower()
# convert to json
df.to_json("data.json", orient="records", indent=4)

print("Converted successfully 🚀")