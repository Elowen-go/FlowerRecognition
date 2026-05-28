import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import os
import time
import sys

os.environ["TORCH_HOME"] = os.path.join(os.path.dirname(__file__), "models", ".cache")

DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "flower_data")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
BATCH_SIZE = 64
EPOCHS = 15
NUM_CLASSES = 102
IMG_SIZE = 224

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"使用设备: {device}", flush=True)


def prepare_data():
    train_transforms = transforms.Compose([
        transforms.RandomResizedCrop(IMG_SIZE),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(30),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    val_transforms = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(IMG_SIZE),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    print("加载训练集...", flush=True)
    train_dataset = datasets.ImageFolder(
        os.path.join(DATA_DIR, "train"), transform=train_transforms
    )
    print("加载验证集...", flush=True)
    val_dataset = datasets.ImageFolder(
        os.path.join(DATA_DIR, "valid"), transform=val_transforms
    )

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    print(f"训练集: {len(train_dataset)} 张, 验证集: {len(val_dataset)} 张", flush=True)
    print(f"类别数: {len(train_dataset.classes)}", flush=True)
    return train_loader, val_loader


def create_model():
    model = models.densenet121(weights=models.DenseNet121_Weights.DEFAULT)

    for param in model.parameters():
        param.requires_grad = False

    model.classifier = nn.Linear(model.classifier.in_features, NUM_CLASSES)

    for param in model.classifier.parameters():
        param.requires_grad = True

    return model.to(device)


def train_model(model, train_loader, val_loader):
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.classifier.parameters(), lr=0.001)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.1)

    best_acc = 0.0
    start_time = time.time()

    for epoch in range(EPOCHS):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        batch_count = len(train_loader)
        batch_start = time.time()

        for batch_idx, (inputs, labels) in enumerate(train_loader):
            inputs, labels = inputs.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

            if (batch_idx + 1) % 20 == 0:
                batch_time = time.time() - batch_start
                print(f"  Epoch {epoch+1} 批次 {batch_idx+1}/{batch_count} | 耗时: {batch_time:.0f}s", flush=True)

        train_acc = 100 * correct / total
        train_loss = running_loss / len(train_loader)

        model.eval()
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                _, predicted = torch.max(outputs, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()

        val_acc = 100 * val_correct / val_total
        scheduler.step()

        elapsed = time.time() - start_time
        print(f"Epoch {epoch+1:2d}/{EPOCHS} | "
              f"Loss: {train_loss:.4f} | "
              f"Train Acc: {train_acc:.2f}% | "
              f"Val Acc: {val_acc:.2f}% | "
              f"耗时: {elapsed:.0f}s", flush=True)

        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), os.path.join(MODEL_DIR, "flower_model.pth"))
            print(f"  → 保存模型 (Val Acc: {val_acc:.2f}%)", flush=True)

    total_time = time.time() - start_time
    print(f"\n训练完成! 总耗时: {total_time:.0f}s, 最佳验证准确率: {best_acc:.2f}%", flush=True)


if __name__ == "__main__":
    print("=" * 50, flush=True)
    print("花卉识别模型训练", flush=True)
    print("=" * 50, flush=True)

    os.makedirs(MODEL_DIR, exist_ok=True)

    if not os.path.exists(DATA_DIR):
        print(f"数据集目录不存在: {DATA_DIR}", flush=True)
        exit(1)

    train_loader, val_loader = prepare_data()
    model = create_model()
    train_model(model, train_loader, val_loader)

    print(f"\n模型已保存至: {os.path.join(MODEL_DIR, 'flower_model.pth')}")
