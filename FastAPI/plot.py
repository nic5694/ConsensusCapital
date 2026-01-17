import matplotlib.pyplot as plt

def plot_history(timestamps, values, title="Title"):
  # Plot the price history
  plt.figure(figsize=(12, 6))
  plt.plot(timestamps, values, marker='o', linestyle='-')

  # Labels and title
  plt.xlabel('Timestamp')
  plt.ylabel('Value')
  plt.title(title)
  plt.grid(True)

  # Show the plot
  plt.tight_layout()
  plt.show()